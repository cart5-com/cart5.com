import { type Context } from 'hono';
import {
    updateRestaurantAddressSchema,
    updateRestaurantDeliveryZoneMapSchema,
    updateRestaurantOpenHoursSchema,
    updateRestaurantTableReservationSettingsSchema,
    updateRestaurantScheduledOrdersSettingsSchema,
    updateRestaurantSchema,
    updateRestaurantTaxSettingsSchema
} from '../../db/schema/restaurant/restaurant.schema';
import type { HonoVariables } from '../../index';
import { type ValidatorContext } from 'lib/types/hono/ValidatorContext';
import { updateRestaurantService } from '../../db/schema/restaurant/restaurant.service';
import { type ErrorType } from 'lib/errors';
import { zValidator } from '@hono/zod-validator';

export const updateRestaurantSchemaValidator = zValidator('json',
    updateRestaurantSchema.omit({
        // unallowed fields for admins
        id: true,
        ownerUserId: true,
        created_at_ts: true,
        updated_at_ts: true
    }).extend({
        address: updateRestaurantAddressSchema.omit({
            restaurantId: true,
        }).optional(),
        openHours: updateRestaurantOpenHoursSchema.omit({
            restaurantId: true,
        }).optional(),
        tableReservationSettings: updateRestaurantTableReservationSettingsSchema.omit({
            restaurantId: true,
        }).optional(),
        taxSettings: updateRestaurantTaxSettingsSchema.omit({
            restaurantId: true,
        }).optional(),
        scheduledOrdersSettings: updateRestaurantScheduledOrdersSettingsSchema.omit({
            restaurantId: true,
        }).optional(),
        deliveryZones: updateRestaurantDeliveryZoneMapSchema.omit({
            restaurantId: true,
        }).optional()
    })
)
export const updateRestaurant = async (c: Context<
    HonoVariables,
    "/:restaurantId",
    ValidatorContext<typeof updateRestaurantSchemaValidator>
>) => {
    const result = (await updateRestaurantService(c.req.param('restaurantId'), c.req.valid('json')));
    return c.json({
        data: result.length > 0 ? 'success' : 'nochange',
        error: null as ErrorType
    }, 200);
}