import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectRestaurantPaymentMethodsSchema } from "@db/schema/restaurant.schema";
import { getRestaurantPaymentMethods_Service } from "@db/services/restaurant.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";

export const getRestaurantPaymentMethods_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectRestaurantPaymentMethodsSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting restaurant payment methods details
export const getRestaurantPaymentMethods_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/payment_methods",
    ValidatorContext<typeof getRestaurantPaymentMethods_SchemaValidator>
>) => {
    return c.json({
        data: await getRestaurantPaymentMethods_Service(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 