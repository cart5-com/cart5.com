import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { type ErrorType } from "@lib/types/errors";
import { updateRestaurantOpenHours_Service } from "@db/services/restaurant.service";
import { updateRestaurantOpenHoursSchema } from "@db/schema/restaurant.schema";

// Schema validation for updating restaurant open hours
export const updateRestaurantOpenHours_SchemaValidator = zValidator('json',
    updateRestaurantOpenHoursSchema.omit({
        // unallowed fields for admins
        restaurantId: true
    }).partial()
)

// Controller for updating restaurant open hours
export const updateRestaurantOpenHours_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/open_hours",
    ValidatorContext<typeof updateRestaurantOpenHours_SchemaValidator>
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
        data: await updateRestaurantOpenHours_Service(restaurantId, data),
        error: null as ErrorType
    }, 200);
} 