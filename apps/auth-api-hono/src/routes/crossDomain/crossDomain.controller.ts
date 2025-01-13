import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { validateTurnstile } from 'lib/utils/validateTurnstile';
import { KNOWN_ERROR } from 'lib/errors';
import { isKnownHostname } from '../../utils/knownHostnames';
import { CROSS_DOMAIN_SESSION_EXPIRES_IN } from 'lib/auth-consts';
import { decryptAndVerifyJwt, signJwtAndEncrypt } from '../../utils/jwt';
import { ENFORCE_HOSTNAME_CHECKS } from '../../enforceHostnameChecks';
import { IS_PROD, getEnvVariable } from 'lib/utils/getEnvVariable';
import type { HonoVariables } from "../../index";
import { createUserSessionAndSetCookie } from '../session/session.controller';
import type { ValidatorContext } from 'lib/types/hono/ValidatorContext';

// Validate the form data - redirectUrl must not be pre-encoded and turnstile token required
export const redirectorSchemaValidator = zValidator('form', z.object({
    // post without encoding, getCrossDomainCallbackUrl will encode
    redirectUrl: z.string()
        .min(1, { message: "Redirect URL required" })
        .refine((url) => {
            try {
                // If the URL is encoded, decoding it will change it
                return url === decodeURIComponent(url);
            } catch {
                return false;
            }
        }, { message: "Redirect URL must not be encoded" }),
    turnstile: z.string().min(1, { message: "Verification required" })
}))
export const redirectorRoute = async (
    c: Context<HonoVariables, "/cross_domain/redirector", ValidatorContext<typeof redirectorSchemaValidator>>
) => {
    const { redirectUrl, turnstile } = c.req.valid('form');

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
    if (ENFORCE_HOSTNAME_CHECKS && !await isKnownHostname(url.hostname, getEnvVariable('KNOWN_DOMAINS_REGEX'), IS_PROD)) {
        throw new KNOWN_ERROR("Invalid redirect URL", "INVALID_REDIRECT_URL");
    }

    const payload: CrossDomainCodePayload = {
        nonce: crypto.randomUUID(),
        userId: user.id,
        turnstile,
        createdAtTimestamp: Date.now(),
        sourceHost: hostHeader,
        targetHost: url.hostname
    };
    // Create encrypted JWT containing session info
    const code = await signJwtAndEncrypt<CrossDomainCodePayload>(
        getEnvVariable('JWT_PRIVATE_KEY'),
        getEnvVariable('ENCRYPTION_KEY'),
        payload,
        CROSS_DOMAIN_SESSION_EXPIRES_IN,
    );

    // Redirect to callback URL on target domain
    return c.redirect(getCrossDomainCallbackUrl(code, redirectUrl));
}


// this is the callback url from the target domain, we use proxy to get the request here.
// Validate query parameters - require code and redirectUrl
export const callbackSchemaValidator = zValidator('query', z.object({
    code: z.string().min(1, { message: "code required" }),
    redirectUrl: z.string().min(1, { message: "redirectUrl required" }),
}))
export const callbackRoute = async (
    c: Context<HonoVariables, "/cross_domain/callback", ValidatorContext<typeof callbackSchemaValidator>>
) => {
    const query = c.req.valid('query');
    const redirectUrl = new URL(decodeURIComponent(query.redirectUrl));

    // Decrypt and verify the JWT token
    const {
        userId,
        turnstile,
        createdAtTimestamp,
        sourceHost,
        targetHost
    } = await decryptAndVerifyJwt<CrossDomainCodePayload>(
        getEnvVariable('JWT_PRIVATE_KEY'),
        getEnvVariable('ENCRYPTION_KEY'),
        query.code
    );


    if (ENFORCE_HOSTNAME_CHECKS && sourceHost !== (`auth.${getEnvVariable('PUBLIC_DOMAIN_NAME')}`)) {
        throw new KNOWN_ERROR("Invalid source host", "INVALID_SOURCE_HOST");
    }

    // Verify turnstile token is valid
    // this will make sure it is used only one time!
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);

    // Validate current domain is in allowed list
    const host = c.req.header()['host'];
    if (!host) {
        throw new KNOWN_ERROR("Host not found", "HOST_NOT_FOUND");
    }

    if (ENFORCE_HOSTNAME_CHECKS && !await isKnownHostname(host, getEnvVariable('KNOWN_DOMAINS_REGEX'), IS_PROD)) {
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

    // Create new permanent session for this domain
    await createUserSessionAndSetCookie(c, userId);

    // Redirect to final destination
    return c.redirect(redirectUrl.toString());
}


type CrossDomainCodePayload = {
    userId: string,
    turnstile: string,
    createdAtTimestamp: number,
    nonce: string,         // Random unique value
    sourceHost: string,    // Original requesting host
    targetHost: string,    // Destination host
};

/**
 * Generates the callback URL for cross-domain authentication
 * @param code - Encrypted JWT containing session information
 * @param redirectUrl - Final destination URL after authentication
 * @returns Full callback URL with parameters
 */
const getCrossDomainCallbackUrl = (code: string, redirectUrl: string) => {
    const url = new URL(redirectUrl);
    // import { createAuthApiClient } from '../authApiClient'
    // const authApiClient = createAuthApiClient(`${url.origin}/__p_auth/`);
    // const goToUrl = new URL(authApiClient.api.cross_domain.callback.$url());
    const goToUrl = new URL(`${url.origin}/__p_auth/api/cross_domain/callback`);
    goToUrl.searchParams.set("code", code);
    goToUrl.searchParams.set("redirectUrl", encodeURIComponent(redirectUrl));
    return goToUrl.toString();
}