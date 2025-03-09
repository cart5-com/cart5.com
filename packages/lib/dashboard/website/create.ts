import { z } from 'zod';
import { type Context } from 'hono';
import { insertWebsitesSchema } from '../../db/schema/website.schema';
import type { HonoVariables } from '../../hono/HonoVariables';
import { type ValidatorContext } from '../../hono/types/ValidatorContext';
import { createWebsiteService } from '../../db/services/website.service';
import { type ErrorType, KNOWN_ERROR } from '../../types/errors';
import { validateCrossDomainTurnstile } from '../../utils/validateTurnstile';
import { zValidator } from '@hono/zod-validator';


export const createWebsiteSchemaValidator = zValidator('form', z.object({
    name: insertWebsitesSchema.shape.name,
    turnstile: z.string().min(1, { message: "Verification required" })
}))

export const createWebsite = async (c: Context<
    HonoVariables,
    "/create-website",
    ValidatorContext<typeof createWebsiteSchemaValidator>
>) => {
    const { name, turnstile } = c.req.valid('form');

    const { userId } = await validateCrossDomainTurnstile(turnstile, c);
    if (userId !== c.get('USER')?.id!) {
        throw new KNOWN_ERROR("Invalid user", "INVALID_USER");
    } else {
        return c.json({
            data: await createWebsiteService(userId, name),
            error: null as ErrorType
        }, 200);
    }
} 