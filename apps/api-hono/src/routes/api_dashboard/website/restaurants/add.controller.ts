import { type Context } from 'hono';
import type { HonoVariables } from '@api-hono/types/HonoVariables';
import { type ErrorType } from '@lib/types/errors';
import { z } from 'zod';
import { addRestaurantToWebsite_Service } from '@db/services/website.service';
import { zValidator } from '@hono/zod-validator';
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';

const addRestaurantSchema = z.object({
    restaurantId: z.string().min(1, { message: "Restaurant ID is required" })
});

export const addRestaurant_SchemaValidator = zValidator('json', addRestaurantSchema);

export const addRestaurant_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/restaurants/add",
    ValidatorContext<typeof addRestaurant_SchemaValidator>
>) => {
    const { restaurantId } = c.req.valid('json');
    const websiteId = c.req.param('websiteId');

    const result = await addRestaurantToWebsite_Service(
        websiteId,
        restaurantId
    );

    return c.json({
        data: result,
        error: null as ErrorType
    }, 200);
} 