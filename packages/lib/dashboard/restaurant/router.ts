import { Hono } from "hono";
import type { HonoVariables } from '../../hono/HonoVariables';
import { type Context, type Next } from 'hono';
import { isUserRestaurantAdminService } from '../../db/services/restaurant.service';
import { KNOWN_ERROR } from '../../types/errors';
import { createRestaurant, createRestaurantSchemaValidator } from './create';
import { updateRestaurant, updateRestaurantSchemaValidator } from './update';
import { getRestaurant, getRestaurantSchemaValidator } from './get';
import { getMyRestaurants } from "./mine";


export const restaurantRouter = new Hono<HonoVariables>()
    .get(
        '/mine',
        getMyRestaurants
    )
    .post('/create',
        createRestaurantSchemaValidator,
        createRestaurant
    )
    .patch('/:restaurantId',
        restaurantRouteAdminCheck,
        updateRestaurantSchemaValidator,
        updateRestaurant
    )
    .post(
        '/:restaurantId',
        restaurantRouteAdminCheck,
        getRestaurantSchemaValidator,
        getRestaurant
    )




async function restaurantRouteAdminCheck(c: Context, next: Next) {
    const userId = c.get('USER')?.id;
    const restaurantId = c.req.param('restaurantId');
    if (!userId || !restaurantId) {
        throw new KNOWN_ERROR("Unauthorized", "UNAUTHORIZED");
    }
    const isAdmin = await isUserRestaurantAdminService(userId, restaurantId);
    if (!isAdmin) {
        throw new KNOWN_ERROR("Not admin", "UNAUTHORIZED");
    }
    await next();
}





