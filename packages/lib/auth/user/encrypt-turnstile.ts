// encryptTurnstileRoute
import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { ErrorType } from '../../types/errors';
import type { HonoVariables } from "../../hono/HonoVariables";
import type { ValidatorContext } from '../../hono/types/ValidatorContext';
import { generateCrossDomainCode } from '../../utils/validateTurnstile';

export const encryptTurnstileSchemaValidator = zValidator('form', z.object({
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

export const encryptTurnstileRoute = async (
    c: Context<
        HonoVariables,
        "/encrypt-turnstile",
        ValidatorContext<typeof encryptTurnstileSchemaValidator>
    >
) => {
    const { redirectUrl, turnstile } = c.req.valid('form');
    const code = await generateCrossDomainCode(c, redirectUrl, turnstile);
    return c.json({
        data: code,
        error: null as ErrorType
    }, 200);
}

