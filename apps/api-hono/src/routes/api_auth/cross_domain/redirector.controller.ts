import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';
import { generateCrossDomainCode } from '@api-hono/utils/validateTurnstile';
import { KNOWN_ERROR } from '@lib/types/errors';
import { createAuthGlobalApiClient } from '@api-client/auth_global';
import { getIpAddress } from '@api-hono/utils/ip_address';

// Validate the form data - redirectUrl must not be pre-encoded and turnstile token required
export const redirectorSchemaValidator = zValidator('form', z.object({
    // post without encoding, getCrossDomainCallbackUrl will encode
    redirectUrl: z.string()
        .min(1, { message: "Redirect URL required" })
        .refine((url) => {
            try {
                // Validate it's a proper URL
                const parsedUrl = new URL(url);

                // Check that the domain and path portions aren't encoded
                const decodedUrl = decodeURIComponent(url);
                const basePartMatch = url.split('?')[0] === decodedUrl.split('?')[0];

                return basePartMatch && parsedUrl;
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
    // Verify user is authenticated
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    const userAgent = c.req.header()['user-agent'];
    const hostHeader = c.req.header()['host'];
    const code = await generateCrossDomainCode(redirectUrl, turnstile, hostHeader, getIpAddress(c), userAgent, user.id);
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

    const callbackUrl: string = createAuthGlobalApiClient(
        `${url.origin}/__p_api/auth_global/`
    )['cross-domain-callback'].$url().toString()

    const goToUrl = new URL(callbackUrl)
    goToUrl.searchParams.set("code", code);
    goToUrl.searchParams.set("redirectUrl", encodeURIComponent(redirectUrl));
    return goToUrl.toString();
}