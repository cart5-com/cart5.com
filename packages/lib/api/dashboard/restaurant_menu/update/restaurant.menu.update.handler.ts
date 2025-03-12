import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ErrorType } from '../../../../types/errors';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { updateMenu_Service } from './restaurant.menu.update.service';
import { zValidator } from '@hono/zod-validator';
import { updateRestaurantMenuSchema } from '../../../../db/schema/restaurant.schema';

export const updateMenu_SchemaValidator = zValidator('json',
    updateRestaurantMenuSchema.omit({
        restaurantId: true
    }).partial()
);

export const updateMenu_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/menu/update",
    ValidatorContext<typeof updateMenu_SchemaValidator>
>) => {
    return c.json({
        data: await updateMenu_Service(c.req.param('restaurantId'), c.req.valid('json')),
        error: null as ErrorType
    });
}; 