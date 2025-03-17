import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectRestaurantSchema } from "@db/schema/restaurant.schema";
import { getRestaurant_Service } from "@db/services/restaurant.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";

export const getRestaurant_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectRestaurantSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting restaurant details
export const getRestaurant_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId",
    ValidatorContext<typeof getRestaurant_SchemaValidator>
>) => {
    return c.json({
        data: await getRestaurant_Service(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
}
