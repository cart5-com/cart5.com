import { type Context } from 'hono';
import type { HonoVariables } from '@api-hono/types/HonoVariables';
import { type ErrorType } from '@lib/types/errors';
import { z } from 'zod';
import { listStoresForWebsite_Service } from '@db/services/website.service';
import { zValidator } from '@hono/zod-validator';
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';

const listStoresSchema = z.object({
    limit: z.coerce.number().optional().default(10),
    offset: z.coerce.number().optional().default(0),
    search: z.string().optional()
});

export const listStores_SchemaValidator = zValidator('query', listStoresSchema);

export const listStores_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/stores/list",
    ValidatorContext<typeof listStores_SchemaValidator>
>) => {
    const { limit, offset, search } = c.req.valid('query');
    const websiteId = c.req.param('websiteId');
    const userId = c.get('USER')?.id;

    return c.json({
        data: await listStoresForWebsite_Service(
            websiteId,
            limit,
            offset,
            search,
            userId
        ),
        error: null as ErrorType
    }, 200);
}