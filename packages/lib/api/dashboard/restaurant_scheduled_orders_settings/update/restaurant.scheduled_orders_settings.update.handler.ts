import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ErrorType } from '../../../../types/errors';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { updateScheduledOrdersSettings_Service } from './restaurant.scheduled_orders_settings.update.service';
import { zValidator } from '@hono/zod-validator';
import { updateRestaurantScheduledOrdersSettingsSchema } from '../../../../db/schema/restaurant.schema';

export const updateScheduledOrdersSettings_SchemaValidator = zValidator('json',
    updateRestaurantScheduledOrdersSettingsSchema.omit({
        restaurantId: true
    }).partial()
);

export const updateScheduledOrdersSettings_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/scheduled_orders_settings/update",
    ValidatorContext<typeof updateScheduledOrdersSettings_SchemaValidator>
>) => {
    return c.json({
        data: await updateScheduledOrdersSettings_Service(c.req.param('restaurantId'), c.req.valid('json')),
        error: null as ErrorType
    });
}; 