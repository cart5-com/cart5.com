import { z } from 'zod';
import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { type ErrorType } from '../../../../types/errors';
import { zValidator } from '@hono/zod-validator';
import { getRestaurant_Service } from './restaurant.get.service';
import {
    selectRestaurantSchema,
} from '../../../../db/schema/restaurant.schema';

// Schema validation for restaurant get
export const getRestaurant_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectRestaurantSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}))

// Controller for restaurant get
export const getRestaurant_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId",
    ValidatorContext<typeof getRestaurant_SchemaValidator>
>) => {
    return c.json({
        data: await getRestaurant_Service(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 