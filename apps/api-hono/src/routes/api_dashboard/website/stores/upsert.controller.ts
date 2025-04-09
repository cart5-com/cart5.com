import { type Context } from 'hono';
import type { HonoVariables } from '@api-hono/types/HonoVariables';
import { type ErrorType } from '@lib/types/errors';
import { z } from 'zod';
import { upsertStoreToWebsite_Service } from '@db/services/website.service';
import { zValidator } from '@hono/zod-validator';
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';
import { ServiceFeeSchema } from '@lib/zod/serviceFee';


const upsertStoreSchema = z.object({
    storeId: z.string().min(1, { message: "Store ID is required" }),
    overrideMarketplaceFee: ServiceFeeSchema.optional()
});

export const upsertStore_SchemaValidator = zValidator('json', upsertStoreSchema);

export const upsertStore_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/stores/upsert",
    ValidatorContext<typeof upsertStore_SchemaValidator>
>) => {
    const { storeId, overrideMarketplaceFee } = c.req.valid('json');
    const websiteId = c.req.param('websiteId');

    const result = await upsertStoreToWebsite_Service(
        websiteId,
        storeId,
        overrideMarketplaceFee
    );

    return c.json({
        data: result,
        error: null as ErrorType
    }, 200);
} 