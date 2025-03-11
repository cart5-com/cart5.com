import { z } from 'zod';
import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { type ErrorType } from '../../../../types/errors';
import { zValidator } from '@hono/zod-validator';
import { getRestaurant_Service } from './restaurant.get.service';
import {
    selectRestaurantSchema,
    selectRestaurantAddressSchema,
    selectRestaurantOpenHoursSchema,
    selectRestaurantMenuSchema,
    selectRestaurantPaymentMethodsSchema,
    selectRestaurantTableReservationSettingsSchema,
    selectRestaurantTaxSettingsSchema,
    selectRestaurantScheduledOrdersSettingsSchema,
    selectRestaurantDeliveryZoneMapSchema
} from '../../../../db/schema/restaurant.schema';

// Schema validation for restaurant get
export const getRestaurant_SchemaValidator = zValidator('json', z.object({
    columns: z.object({
        ...Object.fromEntries(
            Object.keys(selectRestaurantSchema.shape).map(key => [key, z.boolean().optional()])
        ),
        address: z.object(
            Object.fromEntries(
                Object.keys(selectRestaurantAddressSchema.shape).map(key => [key, z.boolean().optional()])
            )
        ).optional(),
        openHours: z.object(
            Object.fromEntries(
                Object.keys(selectRestaurantOpenHoursSchema.shape).map(key => [key, z.boolean().optional()])
            )
        ).optional(),
        menu: z.object(
            Object.fromEntries(
                Object.keys(selectRestaurantMenuSchema.shape).map(key => [key, z.boolean().optional()])
            )
        ).optional(),
        paymentMethods: z.object(
            Object.fromEntries(
                Object.keys(selectRestaurantPaymentMethodsSchema.shape).map(key => [key, z.boolean().optional()])
            )
        ).optional(),
        tableReservationSettings: z.object(
            Object.fromEntries(
                Object.keys(selectRestaurantTableReservationSettingsSchema.shape).map(key => [key, z.boolean().optional()])
            )
        ).optional(),
        taxSettings: z.object(
            Object.fromEntries(
                Object.keys(selectRestaurantTaxSettingsSchema.shape).map(key => [key, z.boolean().optional()])
            )
        ).optional(),
        scheduledOrdersSettings: z.object(
            Object.fromEntries(
                Object.keys(selectRestaurantScheduledOrdersSettingsSchema.shape).map(key => [key, z.boolean().optional()])
            )
        ).optional(),
        deliveryZones: z.object(
            Object.fromEntries(
                Object.keys(selectRestaurantDeliveryZoneMapSchema.shape).map(key => [key, z.boolean().optional()])
            )
        ).optional()
    }) as z.ZodType<Parameters<typeof getRestaurant_Service>[1]>
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