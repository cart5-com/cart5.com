import { z } from 'zod';
import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { type ErrorType } from '../../../../types/errors';
import { zValidator } from '@hono/zod-validator';
import { getAddress_Service } from './restaurant.address.get.service';
import { selectRestaurantAddressSchema } from '../../../../db/schema/restaurant.schema';

export const getAddress_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectRestaurantAddressSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting restaurant address details
export const getAddress_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/address/get",
    ValidatorContext<typeof getAddress_SchemaValidator>
>) => {
    return c.json({
        data: await getAddress_Service(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 