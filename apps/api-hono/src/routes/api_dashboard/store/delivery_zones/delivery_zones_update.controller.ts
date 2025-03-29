import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { type ErrorType } from "@lib/types/errors";
import { updateStoreDeliveryZones_Service } from "@db/services/store.service";
import { updateStoreDeliveryZoneMapSchema } from "@db/schema/store.schema";
import { processDataToSaveDeliveryZones } from "@lib/utils/calculateDeliveryZoneMinsMaxs";
// Schema validation for updating store delivery zones

export const updateStoreDeliveryZones_SchemaValidator = zValidator('json',
    updateStoreDeliveryZoneMapSchema.omit({
        // unallowed fields for admins
        storeId: true
    }).partial()
)

// Controller for updating store delivery zones
export const updateStoreDeliveryZones_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/delivery_zones",
    ValidatorContext<typeof updateStoreDeliveryZones_SchemaValidator>
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
        data: await updateStoreDeliveryZones_Service(storeId, processDataToSaveDeliveryZones(data)),
        error: null as ErrorType
    }, 200);

} 