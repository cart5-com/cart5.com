import { decryptAndVerifyJwt, signJwtAndEncrypt } from './jwt';
import { KNOWN_ERROR } from '@lib/types/errors';
import { getEnvVariable } from '@lib/utils/getEnvVariable';
import { ENFORCE_HOSTNAME_CHECKS } from '@lib/utils/enforceHostnameChecks';
import { isKnownHostname } from './knownHostnames';
import { CROSS_DOMAIN_SESSION_EXPIRES_IN } from '@lib/consts';
import { type Context } from 'hono';
import type { HonoVariables } from '../types/HonoVariables';

export const validateTurnstile = async function (TURNSTILE_SECRET: string, token: string, remoteip?: string) {
    console.log("validateTurnstile: remoteip:", remoteip);
    const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const body: { secret: string; response: string; remoteip?: string } = {
        secret: TURNSTILE_SECRET,
        response: token
    }
    if (remoteip) {
        body.remoteip = remoteip;
    }
    const result = await fetch(url, {
        body: JSON.stringify(body),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const outcome = await result.json() as { success: boolean };
    if (!outcome.success) {
        throw new KNOWN_ERROR("Invalid verification", "INVALID_TURNSTILE_TOKEN");
    }
}

export const generateCrossDomainCode = async function (c: Context<HonoVariables>, redirectUrl: string, turnstile: string) {
    // Security check: Verify request comes from our auth domain
    const hostHeader = c.req.header()['host'];
    if (!hostHeader) {
        throw new KNOWN_ERROR("Host header not found", "HOST_HEADER_NOT_FOUND");
    }

    if (ENFORCE_HOSTNAME_CHECKS && hostHeader !== `auth.${getEnvVariable('PUBLIC_DOMAIN_NAME')}`) {
        throw new KNOWN_ERROR("Invalid host", "INVALID_HOST");
    }

    // Verify user is authenticated
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }

    // Validate target domain is in our allowed list
    const url = new URL(redirectUrl);
    if (ENFORCE_HOSTNAME_CHECKS && !await isKnownHostname(url.hostname, getEnvVariable('KNOWN_DOMAINS_REGEX'))) {
        throw new KNOWN_ERROR("Invalid redirect URL", "INVALID_REDIRECT_URL");
    }

    const payload: CrossDomainCodePayload = {
        nonce: crypto.randomUUID(),
        userId: user.id,
        turnstile,
        createdAtTimestamp: Date.now(),
        sourceHost: hostHeader,
        targetHost: url.hostname,
        ipAddress: c.req.header()['x-forwarded-for'],
        userAgent: c.req.header()['user-agent'],
    };
    // Create encrypted JWT containing session info
    const code = await signJwtAndEncrypt<CrossDomainCodePayload>(
        getEnvVariable('JWT_PRIVATE_KEY'),
        getEnvVariable('ENCRYPTION_KEY'),
        payload,
        CROSS_DOMAIN_SESSION_EXPIRES_IN,
    );
    return code;
}


export const validateCrossDomainTurnstile_WithUserCheck = async function (code: string, c: Context) {
    const result = await validateCrossDomainTurnstile(code, c);
    if (result.userId !== c.get('USER')?.id!) {
        throw new KNOWN_ERROR("Invalid user", "INVALID_USER");
    }
    return result;
}

export const validateCrossDomainTurnstile = async function (code: string, c: Context) {
    const {
        userId,
        turnstile,
        createdAtTimestamp,
        sourceHost,
        targetHost,
        ipAddress,
        userAgent
    } = await decryptAndVerifyJwt<CrossDomainCodePayload>(
        getEnvVariable('JWT_PRIVATE_KEY'),
        getEnvVariable('ENCRYPTION_KEY'),
        code
    );
    if (ENFORCE_HOSTNAME_CHECKS && sourceHost !== (`auth.${getEnvVariable('PUBLIC_DOMAIN_NAME')}`)) {
        throw new KNOWN_ERROR("Invalid source host", "INVALID_SOURCE_HOST");
    }


    // check ip address and user agent
    if (ipAddress !== c.req.header()['x-forwarded-for'] || userAgent !== c.req.header()['user-agent']) {
        throw new KNOWN_ERROR("Invalid ip address or user agent", "INVALID_IP_ADDRESS_OR_USER_AGENT");
    }

    // Verify turnstile token is valid
    // this will make sure it is used only one time!
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);

    // Validate current domain is in allowed list
    const host = c.req.header()['host'];
    if (!host) {
        throw new KNOWN_ERROR("Host not found", "HOST_NOT_FOUND");
    }

    if (ENFORCE_HOSTNAME_CHECKS && !await isKnownHostname(host, getEnvVariable('KNOWN_DOMAINS_REGEX'))) {
        throw new KNOWN_ERROR("Invalid redirect URL", "INVALID_REDIRECT_URL");
    }

    // Validate payload
    if (!userId) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (Date.now() - createdAtTimestamp > CROSS_DOMAIN_SESSION_EXPIRES_IN) {
        throw new KNOWN_ERROR("Code expired", "CODE_EXPIRED");
    }

    if (ENFORCE_HOSTNAME_CHECKS && targetHost !== host) {
        throw new KNOWN_ERROR("Host mismatch", "HOST_MISMATCH");
    }
    return {
        userId,
        turnstile,
        createdAtTimestamp,
        sourceHost,
        targetHost
    }
}


export type CrossDomainCodePayload = {
    userId: string,
    turnstile: string,
    createdAtTimestamp: number,
    nonce: string,         // Random unique value
    sourceHost: string,    // Original requesting host
    targetHost: string,    // Destination host
    ipAddress: string,
    userAgent: string,
};

