import { z } from 'zod';
import { type Context } from 'hono';
import { insertWebsitesSchema } from '../../db/schema/website.schema';
import type { HonoVariables } from '../../hono/HonoVariables';
import { type ValidatorContext } from '../../hono/types/ValidatorContext';
import { createWebsiteService } from '../../db/services/website.service';
import { type ErrorType, KNOWN_ERROR } from '../../types/errors';
import { validateCrossDomainTurnstile } from '../../utils/validateTurnstile';
import { zValidator } from '@hono/zod-validator';
import { extractBaseDomain } from '../../utils/extractBaseDomain';


export const createWebsiteSchemaValidator = zValidator('form', z.object({
    name: insertWebsitesSchema.shape.name,
    defaultHostname: z.string()
        .max(63, { message: "Subdomain must be 63 characters or less" })
        .min(3, { message: "Subdomain must be at least 3 characters" })
        .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, {
            message: "Subdomain can only contain lowercase letters, numbers, and hyphens. It cannot start or end with a hyphen."
        }),
    turnstile: z.string().min(1, { message: "Verification required" })
}))

export const createWebsite = async (c: Context<
    HonoVariables,
    "/create-website",
    ValidatorContext<typeof createWebsiteSchemaValidator>
>) => {
    const { name, defaultHostname, turnstile } = c.req.valid('form');
    const host = c.req.header()['host'] || 'www.cart5dev.com';

    // Extract the base domain from the host
    const baseDomain = extractBaseDomain(host);

    // Create the full hostname by appending the subdomain to the base domain
    const fullHostname = `${defaultHostname}.${baseDomain}`;
    // TODO: validate DNS before creating the website
    const { userId } = await validateCrossDomainTurnstile(turnstile, c);
    if (userId !== c.get('USER')?.id!) {
        throw new KNOWN_ERROR("Invalid user", "INVALID_USER");
    } else {
        return c.json({
            data: await createWebsiteService(userId, name, fullHostname),
            error: null as ErrorType
        }, 200);
    }
} 