import { z } from 'zod';
import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { type ErrorType } from '../../../../types/errors';
import { zValidator } from '@hono/zod-validator';
import { getPaymentMethods_Service } from './restaurant.payment_methods.get.service';
import { selectRestaurantPaymentMethodsSchema } from '../../../../db/schema/restaurant.schema';

export const getPaymentMethods_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectRestaurantPaymentMethodsSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting restaurant payment methods details
export const getPaymentMethods_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/payment_methods/get",
    ValidatorContext<typeof getPaymentMethods_SchemaValidator>
>) => {
    return c.json({
        data: await getPaymentMethods_Service(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 