import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { type ErrorType } from "@lib/types/errors";
import { updateStorePaymentMethods_Service } from "@db/services/store.service";
import { updateStorePaymentMethodsSchema } from "@db/schema/store.schema";

// Schema validation for updating store payment methods
export const updateStorePaymentMethods_SchemaValidator = zValidator('json',
    updateStorePaymentMethodsSchema.omit({
        // unallowed fields for admins
        storeId: true
    }).partial()
)

// Controller for updating store payment methods
export const updateStorePaymentMethods_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/payment_methods",
    ValidatorContext<typeof updateStorePaymentMethods_SchemaValidator>
>) => {
    const storeId = c.req.param('storeId');
    const {
        // unallowed fields for admins // double check after validator
        // @ts-ignore
        storeId: _storeId,

        // other fields are allowed for admins
        ...data
    } = c.req.valid('json');

    return c.json({
        data: await updateStorePaymentMethods_Service(storeId, data),
        error: null as ErrorType
    }, 200);
} 