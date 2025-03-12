import { z } from 'zod';
import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { type ErrorType } from '../../../../types/errors';
import { zValidator } from '@hono/zod-validator';
import { getMenu_Service } from './restaurant.menu.get.service';
import { selectRestaurantMenuSchema } from '../../../../db/schema/restaurant.schema';

export const getMenu_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectRestaurantMenuSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting restaurant menu details
export const getMenu_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/menu/get",
    ValidatorContext<typeof getMenu_SchemaValidator>
>) => {
    return c.json({
        data: await getMenu_Service(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 