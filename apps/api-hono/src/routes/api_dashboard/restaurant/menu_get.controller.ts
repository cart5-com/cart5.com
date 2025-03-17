import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectRestaurantMenuSchema } from "@db/schema/restaurant.schema";
import { getRestaurantMenu_Service } from "@db/services/restaurant.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";

export const getRestaurantMenu_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectRestaurantMenuSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting restaurant menu details
export const getRestaurantMenu_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/menu",
    ValidatorContext<typeof getRestaurantMenu_SchemaValidator>
>) => {
    return c.json({
        data: await getRestaurantMenu_Service(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 