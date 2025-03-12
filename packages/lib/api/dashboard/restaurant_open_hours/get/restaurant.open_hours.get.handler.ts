import { z } from 'zod';
import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { type ErrorType } from '../../../../types/errors';
import { zValidator } from '@hono/zod-validator';
import { getOpenHours_Service } from './restaurant.open_hours.get.service';
import { selectRestaurantOpenHoursSchema } from '../../../../db/schema/restaurant.schema';

export const getOpenHours_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectRestaurantOpenHoursSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting restaurant open hours details
export const getOpenHours_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/open_hours/get",
    ValidatorContext<typeof getOpenHours_SchemaValidator>
>) => {
    return c.json({
        data: await getOpenHours_Service(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 