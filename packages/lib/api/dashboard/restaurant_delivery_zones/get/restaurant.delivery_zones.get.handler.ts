import { z } from 'zod';
import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { type ErrorType } from '../../../../types/errors';
import { zValidator } from '@hono/zod-validator';
import { getDeliveryZones_Service } from './restaurant.delivery_zones.get.service';
import { selectRestaurantDeliveryZoneMapSchema } from '../../../../db/schema/restaurant.schema';

export const getDeliveryZones_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectRestaurantDeliveryZoneMapSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting restaurant delivery zones details
export const getDeliveryZones_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/delivery_zones/get",
    ValidatorContext<typeof getDeliveryZones_SchemaValidator>
>) => {
    return c.json({
        data: await getDeliveryZones_Service(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 