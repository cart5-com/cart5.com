import { type Context } from 'hono';
import { updateWebsitesSchema } from '../../db/schema/website.schema';
import type { HonoVariables } from '../../hono/HonoVariables';
import { type ValidatorContext } from '../../hono/types/ValidatorContext';
import { updateWebsiteService } from '../../db/services/website.service';
import { type ErrorType } from '../../types/errors';
import { zValidator } from '@hono/zod-validator';

export const updateWebsiteSchemaValidator = zValidator('json',
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

export const updateWebsite = async (c: Context<
    HonoVariables,
    "/:websiteId",
    ValidatorContext<typeof updateWebsiteSchemaValidator>
>) => {
    const result = await updateWebsiteService(c.req.param('websiteId'), c.req.valid('json'));
    return c.json({
        data: result ? 'success' : 'nochange',
        error: null as ErrorType
    }, 200);
} 