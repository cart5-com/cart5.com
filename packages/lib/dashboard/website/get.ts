import { z } from 'zod';
import { type Context } from 'hono';
import {
    selectWebsitesSchema,
    selectWebsiteDomainMapSchema
} from '../../db/schema/website.schema';
import type { HonoVariables } from '../../hono/HonoVariables';
import { type ValidatorContext } from '../../hono/types/ValidatorContext';
import { getWebsiteService } from '../../db/services/website.service';
import { type ErrorType } from '../../types/errors';
import { zValidator } from '@hono/zod-validator';

export const getWebsiteSchemaValidator = zValidator('json', z.object({
    columns: z.object({
        ...Object.fromEntries(
            Object.keys(selectWebsitesSchema.shape).map(key => [key, z.boolean().optional()])
        ),
        domains: z.object(
            Object.fromEntries(
                Object.keys(selectWebsiteDomainMapSchema.shape).map(key => [key, z.boolean().optional()])
            )
        ).optional()
    }) as z.ZodType<Parameters<typeof getWebsiteService>[1]>
}))

export const getWebsite = async (c: Context<
    HonoVariables,
    "/:websiteId",
    ValidatorContext<typeof getWebsiteSchemaValidator>
>) => {
    return c.json({
        data: await getWebsiteService(c.req.param('websiteId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 