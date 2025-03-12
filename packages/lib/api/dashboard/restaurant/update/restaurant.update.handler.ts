import { type Context } from 'hono';
import { updateRestaurantSchema } from '../../../../db/schema/restaurant.schema';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { type ErrorType } from '../../../../types/errors';
import { zValidator } from '@hono/zod-validator';
import { updateRestaurant_Service } from './restaurant.update.service';

// Schema validation for restaurant update
export const updateRestaurant_SchemaValidator = zValidator('json',
    updateRestaurantSchema.omit({
        // unallowed fields for admins
        id: true,
        ownerUserId: true,
        created_at_ts: true,
        updated_at_ts: true
    }).partial()
)

// Controller for restaurant update
export const updateRestaurant_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId",
    ValidatorContext<typeof updateRestaurant_SchemaValidator>
>) => {
    return c.json({
        data: await updateRestaurant_Service(c.req.param('restaurantId'), c.req.valid('json')),
        error: null as ErrorType
    }, 200);
} 