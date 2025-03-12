import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ErrorType } from '../../../../types/errors';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { updateTaxSettings_Service } from './restaurant.tax_settings.update.service';
import { zValidator } from '@hono/zod-validator';
import { updateRestaurantTaxSettingsSchema } from '../../../../db/schema/restaurant.schema';

export const updateTaxSettings_SchemaValidator = zValidator('json',
    updateRestaurantTaxSettingsSchema.omit({
        restaurantId: true
    }).partial()
);

export const updateTaxSettings_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/tax_settings/update",
    ValidatorContext<typeof updateTaxSettings_SchemaValidator>
>) => {
    return c.json({
        data: await updateTaxSettings_Service(c.req.param('restaurantId'), c.req.valid('json')),
        error: null as ErrorType
    });
}; 