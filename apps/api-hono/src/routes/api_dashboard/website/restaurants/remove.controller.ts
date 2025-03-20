import { type Context } from 'hono';
import type { HonoVariables } from '@api-hono/types/HonoVariables';
import { type ErrorType } from '@lib/types/errors';
import { z } from 'zod';
import { removeRestaurantFromWebsite_Service } from '@db/services/website.service';
import { zValidator } from '@hono/zod-validator';
import { TEAM_PERMISSIONS } from '@lib/consts';
import { checkWebsitePermissions } from '@api-hono/utils/checkWebsitePermissions';
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';

const removeRestaurantSchema = z.object({
    restaurantId: z.string().min(1, { message: "Restaurant ID is required" })
});

export const removeRestaurant_SchemaValidator = zValidator('json', removeRestaurantSchema);

export const removeRestaurant_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/restaurants/remove",
    ValidatorContext<typeof removeRestaurant_SchemaValidator>
>) => {
    const { restaurantId } = c.req.valid('json');
    const websiteId = c.req.param('websiteId');

    const result = await removeRestaurantFromWebsite_Service(
        websiteId,
        restaurantId
    );

    return c.json({
        data: result,
        error: null as ErrorType
    }, 200);
} 