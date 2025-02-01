import { z } from 'zod';
import { type Context } from 'hono';
import {
    selectRestaurantAddressSchema,
    selectRestaurantDeliveryZoneMapSchema,
    selectRestaurantMenuSchema,
    selectRestaurantSchema,
    selectRestaurantOpenHoursSchema,
    selectRestaurantTableReservationSettingsSchema,
    selectRestaurantScheduledOrdersSettingsSchema,
    selectRestaurantTaxSettingsSchema,
    selectRestaurantPaymentMethodsSchema
} from '../../db/schema/restaurant/restaurant.schema';
import type { HonoVariables } from '../../index';
import { type ValidatorContext } from 'lib/types/hono/ValidatorContext';
import { getRestaurantService } from '../../db/schema/restaurant/restaurant.service';
import { type ErrorType } from 'lib/errors';
import { zValidator } from '@hono/zod-validator';

export const getRestaurantSchemaValidator = zValidator('json', z.object({
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
    }) as z.ZodType<Parameters<typeof getRestaurantService>[1]>
}))
export const getRestaurant = async (c: Context<
    HonoVariables,
    "/:restaurantId",
    ValidatorContext<typeof getRestaurantSchemaValidator>
>) => {

    // restaurantTable._.columns
    // columns ?: Partial<Record<keyof typeof restaurantTable.$inferSelect, boolean>>
    return c.json({
        data: await getRestaurantService(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
}