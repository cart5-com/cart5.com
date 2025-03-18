import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectRestaurantDeliveryZoneMapSchema } from "@db/schema/restaurant.schema";
import { getRestaurantDeliveryZones_Service } from "@db/services/restaurant.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";

export const getRestaurantDeliveryZones_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectRestaurantDeliveryZoneMapSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting restaurant delivery zones details
export const getRestaurantDeliveryZones_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/delivery_zones",
    ValidatorContext<typeof getRestaurantDeliveryZones_SchemaValidator>
>) => {
    return c.json({
        data: await getRestaurantDeliveryZones_Service(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 