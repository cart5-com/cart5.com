import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { type ErrorType } from "@lib/types/errors";
import { updateRestaurantMenu_Service } from "@db/services/restaurant.service";
import { updateRestaurantMenuSchema } from "@db/schema/restaurant.schema";

// Schema validation for updating restaurant menu
export const updateRestaurantMenu_SchemaValidator = zValidator('json',
    updateRestaurantMenuSchema.omit({
        // unallowed fields for admins
        restaurantId: true
    }).partial()
)

// Controller for updating restaurant menu
export const updateRestaurantMenu_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/menu",
    ValidatorContext<typeof updateRestaurantMenu_SchemaValidator>
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
        data: await updateRestaurantMenu_Service(restaurantId, data),
        error: null as ErrorType
    }, 200);
} 