import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createUserSessionAndSetCookie } from '../utils/createUserSessionAndSetCookie';
import { IS_PROD } from '../../utils/getEnvVariable';
import type { HonoVariables } from "../../hono/HonoVariables";
import { markEmailAsVerifiedService, upsertUserService } from '../../db/services/user.service';
import type { ValidatorContext } from '../../hono/types/ValidatorContext';


export const simulateGoogleOAuthCallbackSchemaValidator = zValidator('query', z.object({
    email: z.string().email(),
    redirect_uri: z.string().min(1)
}))
export const simulateGoogleOAuthCallbackRoute = async (
    c: Context<
        HonoVariables,
        "/simulate-google-oauth-callback",
        ValidatorContext<typeof simulateGoogleOAuthCallbackSchemaValidator>
    >
) => {
    if (IS_PROD) {
        return c.text('not allowed in prod');
    } else {
        const { email, redirect_uri } = c.req.valid('query');
        const user = await upsertUserService(email);
        // if email is not verified, mark it as verified
        if (!user.isEmailVerified) {
            await markEmailAsVerifiedService(email);
        }
        await createUserSessionAndSetCookie(c, user.id);
        return c.redirect(decodeURIComponent(redirect_uri));
    }
}
