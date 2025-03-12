import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ErrorType } from '../../../../types/errors';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { updateOpenHours_Service } from './restaurant.open_hours.update.service';
import { zValidator } from '@hono/zod-validator';
import { updateRestaurantOpenHoursSchema } from '../../../../db/schema/restaurant.schema';

export const updateOpenHours_SchemaValidator = zValidator('json',
    updateRestaurantOpenHoursSchema.omit({
        restaurantId: true
    }).partial()
);

export const updateOpenHours_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/open_hours/update",
    ValidatorContext<typeof updateOpenHours_SchemaValidator>
>) => {
    return c.json({
        data: await updateOpenHours_Service(c.req.param('restaurantId'), c.req.valid('json')),
        error: null as ErrorType
    });
}; 