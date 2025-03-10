import { z } from 'zod';
import { type Context } from 'hono';
import { insertWebsitesSchema } from '../../db/schema/website.schema';
import type { HonoVariables } from '../../hono/HonoVariables';
import { type ValidatorContext } from '../../hono/types/ValidatorContext';
import { createWebsiteService } from '../../db/services/website.service';
import { type ErrorType, KNOWN_ERROR } from '../../types/errors';
import { validateCrossDomainTurnstile } from '../../utils/validateTurnstile';
import { zValidator } from '@hono/zod-validator';
import { checkDns } from '../../utils/dnsCheck';
import { IS_PROD } from '../../utils/getEnvVariable';


export const createWebsiteSchemaValidator = zValidator('form', z.object({
    name: insertWebsitesSchema.shape.name,
    defaultHostname: z.string()
        .min(3, { message: "Domain must be at least 3 characters" })
        .max(255, { message: "Domain must be less than 255 characters" })
        .regex(/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, {
            message: "Please enter a valid domain name (e.g., www.example.com)"
        }),
    turnstile: z.string().min(1, { message: "Verification required" })
}))

export const createWebsite = async (c: Context<
    HonoVariables,
    "/create",
    ValidatorContext<typeof createWebsiteSchemaValidator>
>) => {
    const { name, defaultHostname, turnstile } = c.req.valid('form');

    if (IS_PROD) {
        if (!await checkDns(defaultHostname)) {
            throw new KNOWN_ERROR("Invalid DNS", "INVALID_DNS");
        }
    }

    const { userId } = await validateCrossDomainTurnstile(turnstile, c);
    if (userId !== c.get('USER')?.id!) {
        throw new KNOWN_ERROR("Invalid user", "INVALID_USER");
    } else {
        return c.json({
            data: await createWebsiteService(userId, name, defaultHostname),
            error: null as ErrorType
        }, 200);
    }
} 