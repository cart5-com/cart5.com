import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { HonoVariables } from "../../hono/HonoVariables";
import type { ValidatorContext } from '../../hono/types/ValidatorContext';
import { generateCrossDomainCode } from '../../utils/validateTurnstile';

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
    const code = await generateCrossDomainCode(c, redirectUrl, turnstile);
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
    // const goToUrl = new URL(authApiClient.api_auth.cross_domain.callback.$url());
    const goToUrl = new URL(`${url.origin}/__p_api/api_auth_global/cross-domain-callback`);
    goToUrl.searchParams.set("code", code);
    goToUrl.searchParams.set("redirectUrl", encodeURIComponent(redirectUrl));
    return goToUrl.toString();
}