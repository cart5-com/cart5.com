import { type Context } from 'hono';
import type { HonoVariables } from '@api-hono/types/HonoVariables';
import { type ErrorType } from '@lib/types/errors';
import { z } from 'zod';
import { removeStoreFromWebsite_Service } from '@db/services/website.service';
import { zValidator } from '@hono/zod-validator';
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';

const removeStoreSchema = z.object({
    storeId: z.string().min(1, { message: "Store ID is required" })
});

export const removeStore_SchemaValidator = zValidator('json', removeStoreSchema);

export const removeStore_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/stores/remove",
    ValidatorContext<typeof removeStore_SchemaValidator>
>) => {
    const { storeId } = c.req.valid('json');
    const websiteId = c.req.param('websiteId');

    const result = await removeStoreFromWebsite_Service(
        websiteId,
        storeId
    );

    return c.json({
        data: result,
        error: null as ErrorType
    }, 200);
} 