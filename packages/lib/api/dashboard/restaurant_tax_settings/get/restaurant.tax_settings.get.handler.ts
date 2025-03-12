import { z } from 'zod';
import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { type ErrorType } from '../../../../types/errors';
import { zValidator } from '@hono/zod-validator';
import { getTaxSettings_Service } from './restaurant.tax_settings.get.service';
import { selectRestaurantTaxSettingsSchema } from '../../../../db/schema/restaurant.schema';

export const getTaxSettings_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectRestaurantTaxSettingsSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting restaurant tax settings details
export const getTaxSettings_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/tax_settings/get",
    ValidatorContext<typeof getTaxSettings_SchemaValidator>
>) => {
    return c.json({
        data: await getTaxSettings_Service(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 