import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectStorePaymentMethodsSchema } from "@db/schema/store.schema";
import { getStorePaymentMethods_Service } from "@db/services/store.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";

export const getStorePaymentMethods_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectStorePaymentMethodsSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting store payment methods details
export const getStorePaymentMethods_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/payment_methods",
    ValidatorContext<typeof getStorePaymentMethods_SchemaValidator>
>) => {
    return c.json({
        data: await getStorePaymentMethods_Service(c.req.param('storeId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 