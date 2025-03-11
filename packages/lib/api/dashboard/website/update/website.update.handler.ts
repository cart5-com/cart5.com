import { type Context } from 'hono';
import { updateWebsitesSchema } from '../../../../db/schema/website.schema';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { type ErrorType } from '../../../../types/errors';
import { zValidator } from '@hono/zod-validator';
import { updateWebsite_Service } from './website.update.service';

// Schema validation for updating website
export const updateWebsite_SchemaValidator = zValidator('json',
    updateWebsitesSchema.omit({
        // unallowed fields for admins
        id: true,
        defaultHostname: true,
        created_at_ts: true,
        updated_at_ts: true,
        ownerTeamId: true,
        supportTeamId: true
    }).partial()
)
// Controller for updating website
export const updateWebsite_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId",
    ValidatorContext<typeof updateWebsite_SchemaValidator>
>) => {
    const websiteId = c.req.param('websiteId');
    return c.json({
        data: await updateWebsite_Service(websiteId, c.req.valid('json')),
        error: null as ErrorType
    }, 200);
} 