import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ErrorType } from '../../../../types/errors';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { updateAddress_Service } from './restaurant.address.update.service';
import { zValidator } from '@hono/zod-validator';
import { updateRestaurantAddressSchema } from '../../../../db/schema/restaurant.schema';

export const updateAddress_SchemaValidator = zValidator('json',
    updateRestaurantAddressSchema.omit({
        restaurantId: true
    }).partial()
);

export const updateAddress_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/address/update",
    ValidatorContext<typeof updateAddress_SchemaValidator>
>) => {
    return c.json({
        data: await updateAddress_Service(c.req.param('restaurantId'), c.req.valid('json')),
        error: null as ErrorType
    });
}; 