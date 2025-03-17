import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { type ErrorType } from "@lib/types/errors";
import { updateRestaurant_Service } from "@db/services/restaurant.service";
import { updateRestaurantSchema } from "@db/schema/restaurant.schema";

// Schema validation for updating restaurant
export const updateRestaurant_SchemaValidator = zValidator('json',
    updateRestaurantSchema.omit({
        // unallowed fields for admins
        id: true,
        created_at_ts: true,
        updated_at_ts: true,
        ownerTeamId: true,
        supportTeamId: true
    }).partial()
)

// Controller for updating restaurant
export const updateRestaurant_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId",
    ValidatorContext<typeof updateRestaurant_SchemaValidator>
>) => {
    const restaurantId = c.req.param('restaurantId');
    const {
        // unallowed fields for admins // double check after validator
        // @ts-ignore
        id, created_at_ts, updated_at_ts, ownerTeamId, supportTeamId,

        // other fields are allowed for admins
        ...data
    } = c.req.valid('json');

    return c.json({
        data: await updateRestaurant_Service(restaurantId, data),
        error: null as ErrorType
    }, 200);
}
