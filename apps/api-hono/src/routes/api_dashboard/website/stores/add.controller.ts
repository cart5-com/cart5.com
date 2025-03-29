import { type Context } from 'hono';
import type { HonoVariables } from '@api-hono/types/HonoVariables';
import { type ErrorType } from '@lib/types/errors';
import { z } from 'zod';
import { addStoreToWebsite_Service } from '@db/services/website.service';
import { zValidator } from '@hono/zod-validator';
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';

const addStoreSchema = z.object({
    storeId: z.string().min(1, { message: "Store ID is required" })
});

export const addStore_SchemaValidator = zValidator('json', addStoreSchema);

export const addStore_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/stores/add",
    ValidatorContext<typeof addStore_SchemaValidator>
>) => {
    const { storeId } = c.req.valid('json');
    const websiteId = c.req.param('websiteId');

    const result = await addStoreToWebsite_Service(
        websiteId,
        storeId
    );

    return c.json({
        data: result,
        error: null as ErrorType
    }, 200);
} 