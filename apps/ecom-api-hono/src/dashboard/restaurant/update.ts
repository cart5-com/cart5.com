import { type Context } from 'hono';
import { updateRestaurantSchema } from '../../db/schema/restaurant/restaurant.schema';
import type { HonoVariables } from '../../index';
import { type ValidatorContext } from 'lib/types/hono/ValidatorContext';
import { updateRestaurantService } from '../../db/schema/restaurant/restaurant.service';
import { type ErrorType } from 'lib/errors';
import { zValidator } from '@hono/zod-validator';

export const updateRestaurantSchemaValidator = zValidator('json', updateRestaurantSchema.omit({
    // unallowed fields for admins
    id: true,
    ownerUserId: true,
    created_at_ts: true,
    updated_at_ts: true
}))
export const updateRestaurant = async (c: Context<
    HonoVariables,
    "/:restaurantId",
    ValidatorContext<typeof updateRestaurantSchemaValidator>
>) => {
    return c.json({
        data: (await updateRestaurantService(c.req.param('restaurantId'), c.req.valid('json')))
            .rowsAffected === 1 ?
            'success' : 'nochange',
        error: null as ErrorType
    }, 200);
}