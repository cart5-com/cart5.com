import { z } from 'zod';
import { type Context, type Next } from 'hono';
import { insertRestaurantSchema, selectRestaurantSchema, updateRestaurantSchema } from '../../db/schema/restaurantSchema';
import type { HonoVariables } from '../../index';
import { getEnvVariable } from 'lib/utils/getEnvVariable';
import { type ValidatorContext } from 'lib/types/hono/ValidatorContext';
import { checkUserIsRestaurantAdminService, createRestaurantService, getMyRestaurantsService, getRestaurantService, updateRestaurantService } from './restaurant.service';
import { KNOWN_ERROR, type ErrorType } from 'lib/errors';
import { validateTurnstile } from 'lib/utils/validateTurnstile';
import { zValidator } from '@hono/zod-validator';


export const restaurantRouteAdminCheck = async function (c: Context, next: Next) {
    const userId = c.get('USER')?.id;
    const restaurantId = c.req.param('restaurantId');
    if (!userId || !restaurantId) {
        throw new KNOWN_ERROR("Unauthorized", "UNAUTHORIZED");
    }
    const isAdmin = await checkUserIsRestaurantAdminService(userId, restaurantId);
    if (!isAdmin) {
        throw new KNOWN_ERROR("Not admin", "UNAUTHORIZED");
    }
    await next();
}



// get /my-restaurants START
export const getMyRestaurants = async (c: Context) => {
    const userId = c.get('USER')?.id!;
    return c.json({
        data: await getMyRestaurantsService(userId),
        error: null as ErrorType
    }, 200);
}
// get /my-restaurants END






// post /create-restaurant START
export const createRestaurantSchemaValidator = zValidator('form', z.object({
    name: insertRestaurantSchema.shape.name,
    turnstile: z.string().min(1, { message: "Verification required" })
}))
export const createRestaurant = async (c: Context<
    HonoVariables,
    "/create-restaurant",
    ValidatorContext<typeof createRestaurantSchemaValidator>
>) => {
    const { name, turnstile } = c.req.valid('form');
    await validateTurnstile(getEnvVariable("TURNSTILE_SECRET"), turnstile, c.req.header()['x-forwarded-for']);
    const userId = c.get('USER')?.id!;
    return c.json({
        data: await createRestaurantService(userId, name),
        error: null as ErrorType
    }, 200);
}
// post /create-restaurant END









// post /update/:restaurantId START
export const updateRestaurantSchemaValidator = zValidator('json', updateRestaurantSchema.omit({
    // unallowed fields for admins
    id: true,
    ownerUserId: true,
    created_at_ts: true,
    updated_at_ts: true
}))
export const updateRestaurant = async (c: Context<
    HonoVariables,
    "/update/:restaurantId",
    ValidatorContext<typeof updateRestaurantSchemaValidator>
>) => {
    return c.json({
        data: (await updateRestaurantService(c.req.param('restaurantId'), c.req.valid('json')))
            .rowsAffected === 1 ?
            'success' : 'nochange',
        error: null as ErrorType
    }, 200);
}
// post /update/:restaurantId END







// post /:restaurantId START
export const getRestaurantSchemaValidator = zValidator('json', z.object({
    // columns?: Partial<Record<keyof typeof restaurantTable.$inferSelect, boolean>>,
    columns: z.record(z.enum(selectRestaurantSchema.keyof().options), z.boolean())
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
// post /:restaurantId END