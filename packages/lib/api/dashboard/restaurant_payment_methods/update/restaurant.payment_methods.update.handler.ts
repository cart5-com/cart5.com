import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ErrorType } from '../../../../types/errors';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { updatePaymentMethods_Service } from './restaurant.payment_methods.update.service';
import { zValidator } from '@hono/zod-validator';
import { updateRestaurantPaymentMethodsSchema } from '../../../../db/schema/restaurant.schema';

export const updatePaymentMethods_SchemaValidator = zValidator('json',
    updateRestaurantPaymentMethodsSchema.omit({
        restaurantId: true
    }).partial()
);

export const updatePaymentMethods_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/payment_methods/update",
    ValidatorContext<typeof updatePaymentMethods_SchemaValidator>
>) => {
    return c.json({
        data: await updatePaymentMethods_Service(c.req.param('restaurantId'), c.req.valid('json')),
        error: null as ErrorType
    });
}; 