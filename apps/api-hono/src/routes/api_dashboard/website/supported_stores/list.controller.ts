import { type Context } from 'hono';
import type { HonoVariables } from '@api-hono/types/HonoVariables';
import { type ErrorType } from '@lib/types/errors';
import { z } from 'zod';
import { listSupportedStores_Service } from '@db/services/website.service';
import { zValidator } from '@hono/zod-validator';
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';

const listSupportedStoresSchema = z.object({
    limit: z.coerce.number().optional().default(10),
    offset: z.coerce.number().optional().default(0),
    search: z.string().optional()
});

export const listSupportedStores_SchemaValidator = zValidator('query', listSupportedStoresSchema);

export const listSupportedStores_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/supported_stores/list",
    ValidatorContext<typeof listSupportedStores_SchemaValidator>
>) => {
    const { limit, offset, search } = c.req.valid('query');
    const websiteId = c.req.param('websiteId');

    return c.json({
        data: await listSupportedStores_Service(
            websiteId,
            limit,
            offset,
            search
        ),
        error: null as ErrorType
    }, 200);
}