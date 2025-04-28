import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { type ErrorType } from "@lib/types/errors";
import { updateStoreStripeConnectSettings_Service } from "@db/services/store.service";
import { updateStoreStripeConnectSettingsSchema } from "@db/schema/store.schema";

// Schema validation for updating store stripe settings
export const updateStoreStripeSettings_SchemaValidator = zValidator('json',
    updateStoreStripeConnectSettingsSchema.omit({
        // unallowed fields for admins
        storeId: true,
        stripeConnectAccountId: true,
    }).partial()
)

// Controller for updating store stripe settings
export const updateStoreStripeSettings_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/stripe/settings",
    ValidatorContext<typeof updateStoreStripeSettings_SchemaValidator>
>) => {
    const storeId = c.req.param('storeId');
    const {
        // unallowed fields for admins // double check after validator
        // @ts-ignore
        storeId: _storeId, stripeConnectAccountId: _stripeConnectAccountId,

        // other fields are allowed for admins
        ...data
    } = c.req.valid('json');

    return c.json({
        data: await updateStoreStripeConnectSettings_Service(storeId, data),
        error: null as ErrorType
    }, 200);
}
