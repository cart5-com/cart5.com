import { type Context } from 'hono';
import {
    updateRestaurantAddressSchema,
    updateRestaurantDeliveryZoneMapSchema,
    updateRestaurantMenuSchema,
    updateRestaurantOpenHoursSchema,
    updateRestaurantTableReservationSettingsSchema,
    updateRestaurantScheduledOrdersSettingsSchema,
    updateRestaurantSchema,
    updateRestaurantTaxSettingsSchema,
    updateRestaurantPaymentMethodsSchema
} from '../../db/schema/restaurant.schema';
import type { HonoVariables } from '../../hono/HonoVariables';
import { type ValidatorContext } from '../../hono/types/ValidatorContext';
import { updateRestaurantService } from '../../db/services/restaurant.service';
import { type ErrorType } from '../../types/errors';
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
        menu: updateRestaurantMenuSchema.omit({
            restaurantId: true,
        }).optional(),
        paymentMethods: updateRestaurantPaymentMethodsSchema.omit({
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