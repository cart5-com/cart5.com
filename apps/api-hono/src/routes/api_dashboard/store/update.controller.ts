import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { type ErrorType } from "@lib/types/errors";
import { updateStore_Service } from "@db/services/store.service";
import { updateStoreSchema } from "@db/schema/store.schema";

// Schema validation for updating store
export const updateStore_SchemaValidator = zValidator('json',
    updateStoreSchema.omit({
        // unallowed fields for admins
        id: true,
        created_at_ts: true,
        updated_at_ts: true,
        ownerTeamId: true,
        supportTeamId: true
    }).partial()
)

// Controller for updating store
export const updateStore_Handler = async (c: Context<
    HonoVariables,
    "/:storeId",
    ValidatorContext<typeof updateStore_SchemaValidator>
>) => {
    const storeId = c.req.param('storeId');
    const {
        // unallowed fields for admins // double check after validator
        // @ts-ignore
        id, created_at_ts, updated_at_ts, ownerTeamId, supportTeamId,

        // other fields are allowed for admins
        ...data
    } = c.req.valid('json');

    return c.json({
        data: await updateStore_Service(storeId, data),
        error: null as ErrorType
    }, 200);
}
