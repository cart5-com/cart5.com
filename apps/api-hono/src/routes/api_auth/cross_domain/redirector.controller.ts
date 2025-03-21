import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';
import { generateCrossDomainCode } from '@api-hono/utils/validateTurnstile';
import { KNOWN_ERROR } from '@lib/types/errors';
import { createApiClient } from '@api-client/index';

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
    // Verify user is authenticated
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    const ipAddress = c.req.header()['x-forwarded-for'];
    const userAgent = c.req.header()['user-agent'];
    const hostHeader = c.req.header()['host'];
    const code = await generateCrossDomainCode(redirectUrl, turnstile, hostHeader, ipAddress, userAgent, user.id);
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

    const callbackUrl: string = createApiClient(
        `${url.origin}/__p_api/`
    ).auth_global['cross-domain-callback'].$url().toString()

    const goToUrl = new URL(callbackUrl)
    goToUrl.searchParams.set("code", code);
    goToUrl.searchParams.set("redirectUrl", encodeURIComponent(redirectUrl));
    return goToUrl.toString();
}