import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ErrorType } from '../../../../types/errors';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { updateTableReservationSettings_Service } from './restaurant.table_reservation_settings.update.service';
import { zValidator } from '@hono/zod-validator';
import { updateRestaurantTableReservationSettingsSchema } from '../../../../db/schema/restaurant.schema';

export const updateTableReservationSettings_SchemaValidator = zValidator('json',
    updateRestaurantTableReservationSettingsSchema.omit({
        restaurantId: true
    }).partial()
);

export const updateTableReservationSettings_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/table_reservation_settings/update",
    ValidatorContext<typeof updateTableReservationSettings_SchemaValidator>
>) => {
    return c.json({
        data: await updateTableReservationSettings_Service(c.req.param('restaurantId'), c.req.valid('json')),
        error: null as ErrorType
    });
}; 