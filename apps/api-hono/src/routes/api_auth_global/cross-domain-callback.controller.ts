import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { validateCrossDomainTurnstile } from '@api-hono/utils/validateTurnstile';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { createUserSessionAndSetCookie } from '@api-hono/utils/createUserSessionAndSetCookie';
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';
import { KNOWN_ERROR } from '@lib/types/errors';


// this is the callback url from the target domain, we use proxy to get the request here.
// Validate query parameters - require code and redirectUrl
export const callbackSchemaValidator = zValidator('query', z.object({
    code: z.string().min(1, { message: "code required" }),
    redirectUrl: z.string().min(1, { message: "redirectUrl required" }),
}))
export const callbackRoute = async (
    c: Context<
        HonoVariables,
        "/cross-domain-callback",
        ValidatorContext<typeof callbackSchemaValidator>
    >
) => {
    const query = c.req.valid('query');
    const redirectUrl = new URL(decodeURIComponent(query.redirectUrl));

    // Decrypt and verify the JWT token
    const { userId } = await validateCrossDomainTurnstile(
        query.code,
        c.req.header()['x-forwarded-for'],
        c.req.header()['user-agent'],
        c.req.header()['host']
    );
    // Validate payload
    if (!userId) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    // Create new permanent session for this domain
    await createUserSessionAndSetCookie(c, userId);
    redirectUrl.hash = "after-login";
    //history.replaceState(null, null, ' ');
    //history.pushState(null, null, ' ')

    // Redirect to final destination
    return c.redirect(redirectUrl.toString());
}