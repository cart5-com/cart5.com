import { z } from 'zod';
import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { type ErrorType } from '../../../../types/errors';
import { zValidator } from '@hono/zod-validator';
import { getTableReservationSettings_Service } from './restaurant.table_reservation_settings.get.service';
import { selectRestaurantTableReservationSettingsSchema } from '../../../../db/schema/restaurant.schema';

export const getTableReservationSettings_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectRestaurantTableReservationSettingsSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting restaurant table reservation settings details
export const getTableReservationSettings_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/table_reservation_settings/get",
    ValidatorContext<typeof getTableReservationSettings_SchemaValidator>
>) => {
    return c.json({
        data: await getTableReservationSettings_Service(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 