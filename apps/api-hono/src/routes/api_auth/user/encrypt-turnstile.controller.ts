import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { ErrorType } from '@lib/types/errors';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';
import { generateCrossDomainCode } from '@api-hono/utils/validateTurnstile';

export const encryptTurnstileSchemaValidator = zValidator('form', z.object({
    redirectUrl: z.string()
        .min(1, { message: "Redirect URL required" })
        .refine((url) => {
            try {
                // Validate it's a proper URL
                const parsedUrl = new URL(url);

                // Check that the domain and path portions aren't encoded
                const decodedUrl = decodeURIComponent(url);
                const basePartMatch = url.split('?')[0] === decodedUrl.split('?')[0];

                return basePartMatch;
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
    const ipAddress = c.req.header()['x-forwarded-for'];
    const userAgent = c.req.header()['user-agent'];
    const hostHeader = c.req.header()['host'];
    const code = await generateCrossDomainCode(
        redirectUrl,
        turnstile,
        hostHeader,
        ipAddress,
        userAgent,
        c.get("USER")?.id);
    return c.json({
        data: code,
        error: null as ErrorType
    }, 200);
}

