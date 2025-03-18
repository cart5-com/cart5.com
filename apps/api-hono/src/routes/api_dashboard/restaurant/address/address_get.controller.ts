import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectRestaurantAddressSchema } from "@db/schema/restaurant.schema";
import { getRestaurantAddress_Service } from "@db/services/restaurant.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";

export const getRestaurantAddress_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectRestaurantAddressSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting restaurant address details
export const getRestaurantAddress_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/address",
    ValidatorContext<typeof getRestaurantAddress_SchemaValidator>
>) => {
    return c.json({
        data: await getRestaurantAddress_Service(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
}
