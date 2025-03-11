import { z } from 'zod';
import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { type ErrorType } from '../../../../types/errors';
import { zValidator } from '@hono/zod-validator';
import { getWebsite_Service } from './website.get.service';
import { selectWebsitesSchema } from '../../../../db/schema/website.schema';

export const getWebsite_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectWebsitesSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting website details
export const getWebsite_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId",
    ValidatorContext<typeof getWebsite_SchemaValidator>
>) => {
    return c.json({
        data: await getWebsite_Service(c.req.param('websiteId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 