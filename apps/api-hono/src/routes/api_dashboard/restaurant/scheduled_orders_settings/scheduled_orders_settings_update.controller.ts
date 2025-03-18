import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { type ErrorType } from "@lib/types/errors";
import { updateRestaurantScheduledOrdersSettings_Service } from "@db/services/restaurant.service";
import { updateRestaurantScheduledOrdersSettingsSchema } from "@db/schema/restaurant.schema";
import { calculateScheduledOrdersMinutes } from "./scheduled_orders_settings.calc";

// Schema validation for updating restaurant scheduled orders settings
export const updateRestaurantScheduledOrdersSettings_SchemaValidator = zValidator('json',
    updateRestaurantScheduledOrdersSettingsSchema.omit({
        // unallowed fields for admins
        restaurantId: true
    }).partial()
)

// Controller for updating restaurant scheduled orders settings
export const updateRestaurantScheduledOrdersSettings_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/scheduled_orders_settings",
    ValidatorContext<typeof updateRestaurantScheduledOrdersSettings_SchemaValidator>
>) => {
    const restaurantId = c.req.param('restaurantId');
    const scheduledOrdersSettingsData = c.req.valid('json');
    const {
        pickup_minTimeInAdvance_minutes,
        pickup_maxTimeInAdvance_minutes,
        delivery_minTimeInAdvance_minutes,
        delivery_maxTimeInAdvance_minutes
    } = calculateScheduledOrdersMinutes(scheduledOrdersSettingsData);
    const scheduledOrdersSettingsDataWithMinutes = {
        ...scheduledOrdersSettingsData,
        pickup_minTimeInAdvance_minutes,
        pickup_maxTimeInAdvance_minutes,
        delivery_minTimeInAdvance_minutes,
        delivery_maxTimeInAdvance_minutes
    }
    const {
        // unallowed fields for admins // double check after validator
        // @ts-ignore
        restaurantId: _restaurantId,

        // other fields are allowed for admins
        ...data
    } = scheduledOrdersSettingsDataWithMinutes;
    return c.json({
        data: await updateRestaurantScheduledOrdersSettings_Service(
            restaurantId,
            data
        ),
        error: null as ErrorType
    }, 200);
} 