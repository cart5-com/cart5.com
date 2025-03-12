import { z } from 'zod';
import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { type ErrorType } from '../../../../types/errors';
import { zValidator } from '@hono/zod-validator';
import { getScheduledOrdersSettings_Service } from './restaurant.scheduled_orders_settings.get.service';
import { selectRestaurantScheduledOrdersSettingsSchema } from '../../../../db/schema/restaurant.schema';

export const getScheduledOrdersSettings_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectRestaurantScheduledOrdersSettingsSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting restaurant scheduled orders settings details
export const getScheduledOrdersSettings_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/scheduled_orders_settings/get",
    ValidatorContext<typeof getScheduledOrdersSettings_SchemaValidator>
>) => {
    return c.json({
        data: await getScheduledOrdersSettings_Service(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 