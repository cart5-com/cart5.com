import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { type ErrorType } from "@lib/types/errors";
import { updateStoreMenu_Service } from "@db/services/store.service";
import { updateStoreMenuSchema } from "@db/schema/store.schema";

// Schema validation for updating store menu
export const updateStoreMenu_SchemaValidator = zValidator('json',
    updateStoreMenuSchema.omit({
        // unallowed fields for admins
        storeId: true
    }).partial()
)

// Controller for updating store menu
export const updateStoreMenu_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/menu",
    ValidatorContext<typeof updateStoreMenu_SchemaValidator>
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
        data: await updateStoreMenu_Service(storeId, data),
        error: null as ErrorType
    }, 200);
} 