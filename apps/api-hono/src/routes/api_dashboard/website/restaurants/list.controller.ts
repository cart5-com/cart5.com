import { type Context } from 'hono';
import type { HonoVariables } from '@api-hono/types/HonoVariables';
import { type ErrorType } from '@lib/types/errors';
import { z } from 'zod';
import { listRestaurantsForWebsite_Service } from '@db/services/website.service';
import { zValidator } from '@hono/zod-validator';
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';

const listRestaurantsSchema = z.object({
    limit: z.coerce.number().optional().default(10),
    offset: z.coerce.number().optional().default(0),
    search: z.string().optional()
});

export const listRestaurants_SchemaValidator = zValidator('query', listRestaurantsSchema);

export const listRestaurants_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/restaurants/list",
    ValidatorContext<typeof listRestaurants_SchemaValidator>
>) => {
    const { limit, offset, search } = c.req.valid('query');
    const websiteId = c.req.param('websiteId');
    const userId = c.get('USER')?.id;

    return c.json({
        data: await listRestaurantsForWebsite_Service(
            websiteId,
            limit,
            offset,
            search,
            userId
        ),
        error: null as ErrorType
    }, 200);
}