import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { KNOWN_ERROR } from 'lib/errors';
import { isKnownHostname } from '../utils/knownHostnames';
import { CROSS_DOMAIN_SESSION_EXPIRES_IN } from 'lib/consts/auth-consts';
import { signJwtAndEncrypt } from '../utils/jwt';
import { ENFORCE_HOSTNAME_CHECKS } from '../enforceHostnameChecks';
import { IS_PROD, getEnvVariable } from 'lib/utils/getEnvVariable';
import type { HonoVariables } from "../index";
import type { ValidatorContext } from 'lib/hono/types/ValidatorContext';


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
    c: Context<
        HonoVariables,
        "/redirector",
        ValidatorContext<typeof redirectorSchemaValidator>
    >
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


export type CrossDomainCodePayload = {
    userId: string,
    turnstile: string,
    createdAtTimestamp: number,
    nonce: string,         // Random unique value
    sourceHost: string,    // Original requesting host
    targetHost: string,    // Destination host
};

