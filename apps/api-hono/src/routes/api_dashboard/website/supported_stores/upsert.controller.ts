import { type Context } from 'hono';
import type { HonoVariables } from '@api-hono/types/HonoVariables';
import { type ErrorType } from '@lib/types/errors';
import { z } from 'zod';
import { upsertSupportedStore_Service } from '@db/services/website.service';
import { zValidator } from '@hono/zod-validator';
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';
import { ServiceFeeSchema } from '@lib/zod/serviceFee';


const upsertSupportedStoreSchema = z.object({
    storeId: z.string().min(1, { message: "Store ID is required" }),
    overridePartnerFee: ServiceFeeSchema.optional()
});

export const upsertSupportedStore_SchemaValidator = zValidator('json', upsertSupportedStoreSchema);

export const upsertSupportedStore_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/supported_stores/upsert",
    ValidatorContext<typeof upsertSupportedStore_SchemaValidator>
>) => {
    const { storeId, overridePartnerFee } = c.req.valid('json');
    const websiteId = c.req.param('websiteId');

    const result = await upsertSupportedStore_Service(
        websiteId,
        storeId,
        overridePartnerFee
    );

    return c.json({
        data: result,
        error: null as ErrorType
    }, 200);
} 