import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectRestaurantTableReservationSettingsSchema } from "@db/schema/restaurant.schema";
import { getRestaurantTableReservationSettings_Service } from "@db/services/restaurant.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";

export const getRestaurantTableReservationSettings_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectRestaurantTableReservationSettingsSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting restaurant table reservation settings details
export const getRestaurantTableReservationSettings_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/table_reservation_settings",
    ValidatorContext<typeof getRestaurantTableReservationSettings_SchemaValidator>
>) => {
    return c.json({
        data: await getRestaurantTableReservationSettings_Service(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 