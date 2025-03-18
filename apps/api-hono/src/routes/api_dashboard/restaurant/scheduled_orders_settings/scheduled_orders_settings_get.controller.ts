import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectRestaurantScheduledOrdersSettingsSchema } from "@db/schema/restaurant.schema";
import { getRestaurantScheduledOrdersSettings_Service } from "@db/services/restaurant.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";

export const getRestaurantScheduledOrdersSettings_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectRestaurantScheduledOrdersSettingsSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting restaurant scheduled orders settings details
export const getRestaurantScheduledOrdersSettings_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/scheduled_orders_settings",
    ValidatorContext<typeof getRestaurantScheduledOrdersSettings_SchemaValidator>
>) => {
    return c.json({
        data: await getRestaurantScheduledOrdersSettings_Service(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 