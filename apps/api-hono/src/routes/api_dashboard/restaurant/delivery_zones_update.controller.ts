import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { type ErrorType } from "@lib/types/errors";
import { updateRestaurantDeliveryZones_Service } from "@db/services/restaurant.service";
import { updateRestaurantDeliveryZoneMapSchema } from "@db/schema/restaurant.schema";

// Schema validation for updating restaurant delivery zones
export const updateRestaurantDeliveryZones_SchemaValidator = zValidator('json',
    updateRestaurantDeliveryZoneMapSchema.omit({
        // unallowed fields for admins
        restaurantId: true
    }).partial()
)

// Controller for updating restaurant delivery zones
export const updateRestaurantDeliveryZones_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/delivery_zones",
    ValidatorContext<typeof updateRestaurantDeliveryZones_SchemaValidator>
>) => {
    const restaurantId = c.req.param('restaurantId');
    const {
        // unallowed fields for admins // double check after validator
        // @ts-ignore
        restaurantId: _restaurantId,

        // other fields are allowed for admins
        ...data
    } = c.req.valid('json');

    return c.json({
        data: await updateRestaurantDeliveryZones_Service(restaurantId, data),
        error: null as ErrorType
    }, 200);
} 