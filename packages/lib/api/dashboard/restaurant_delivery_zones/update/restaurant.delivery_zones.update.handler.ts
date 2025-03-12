import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ErrorType } from '../../../../types/errors';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { updateDeliveryZones_Service } from './restaurant.delivery_zones.update.service';
import { zValidator } from '@hono/zod-validator';
import { updateRestaurantDeliveryZoneMapSchema } from '../../../../db/schema/restaurant.schema';

export const updateDeliveryZones_SchemaValidator = zValidator('json',
    updateRestaurantDeliveryZoneMapSchema.omit({
        restaurantId: true
    }).partial()
);

export const updateDeliveryZones_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/delivery_zones/update",
    ValidatorContext<typeof updateDeliveryZones_SchemaValidator>
>) => {
    return c.json({
        data: await updateDeliveryZones_Service(c.req.param('restaurantId'), c.req.valid('json')),
        error: null as ErrorType
    });
}; 