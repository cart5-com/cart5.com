import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { type ErrorType } from "@lib/types/errors";
import { updateStoreOpenHours_Service } from "@db/services/store.service";
import { updateStoreOpenHoursSchema } from "@db/schema/store.schema";

// Schema validation for updating store open hours
export const updateStoreOpenHours_SchemaValidator = zValidator('json',
    updateStoreOpenHoursSchema.omit({
        // unallowed fields for admins
        storeId: true
    }).partial()
)

// Controller for updating store open hours
export const updateStoreOpenHours_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/open_hours",
    ValidatorContext<typeof updateStoreOpenHours_SchemaValidator>
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
        data: await updateStoreOpenHours_Service(storeId, data),
        error: null as ErrorType
    }, 200);
} 