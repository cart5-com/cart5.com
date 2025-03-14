import { z } from 'zod';
import { type Context } from 'hono';
import { insertWebsitesSchema } from '../../../../db/schema/website.schema';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { type ErrorType } from '../../../../types/errors';
import { validateCrossDomainTurnstile_WithUserCheck } from '../../../../utils/validateTurnstile';
import { zValidator } from '@hono/zod-validator';
import { createWebsite_Service } from './website.create.service';
import { getSupportTeamByHostname_Service } from '../../website_domains/_service_utils/getTeamByHostname_Service';

// Schema validation for website creation
export const createWebsite_SchemaValidator = zValidator('form', z.object({
    name: insertWebsitesSchema.shape.name,
    turnstile: z.string().min(1, { message: "Verification required" })
}));

// Controller for website creation
export const createWebsite_Handler = async (c: Context<
    HonoVariables,
    "/create",
    ValidatorContext<typeof createWebsite_SchemaValidator>
>) => {
    const { name, turnstile } = c.req.valid('form');

    // Validate turnstile and user
    const { userId } = await validateCrossDomainTurnstile_WithUserCheck(turnstile, c);
    const supportTeam = await getSupportTeamByHostname_Service(c.req.header()['host'])
    return c.json({
        data: await createWebsite_Service(userId, name, supportTeam?.teamId ?? null),
        error: null as ErrorType
    }, 200);
} 