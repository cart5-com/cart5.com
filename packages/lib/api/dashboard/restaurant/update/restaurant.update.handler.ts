import { type Context } from 'hono';
import { updateRestaurantSchema } from '../../../../db/schema/restaurant.schema';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { type ErrorType } from '../../../../types/errors';
import { zValidator } from '@hono/zod-validator';
import { updateRestaurant_Service } from './restaurant.update.service';
import {
    updateRestaurantAddressSchema,
    updateRestaurantOpenHoursSchema,
    updateRestaurantMenuSchema,
    updateRestaurantPaymentMethodsSchema,
    updateRestaurantTableReservationSettingsSchema,
    updateRestaurantTaxSettingsSchema,
    updateRestaurantScheduledOrdersSettingsSchema,
    updateRestaurantDeliveryZoneMapSchema
} from '../../../../db/schema/restaurant.schema';


// Schema validation for restaurant update
export const updateRestaurant_SchemaValidator = zValidator('json',
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

// Controller for restaurant update
export const updateRestaurant_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId",
    ValidatorContext<typeof updateRestaurant_SchemaValidator>
>) => {
    const restaurantId = c.req.param('restaurantId');
    const updateData = c.req.valid('json');

    return c.json({
        data: await updateRestaurant_Service(restaurantId, updateData),
        error: null as ErrorType
    }, 200);
} 