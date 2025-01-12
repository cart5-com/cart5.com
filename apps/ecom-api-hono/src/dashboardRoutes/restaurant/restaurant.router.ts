import { Hono } from "hono";
import type { HonoVariables } from '../../index';
import {
    createRestaurant,
    getMyRestaurants,
    getRestaurant,
    getRestaurantSchemaValidator,
    restaurantRouteAdminCheck,
    updateRestaurant,
    updateRestaurantSchemaValidator
} from './restaurant.controller';
import { createRestaurantSchemaValidator } from './restaurant.controller';


export const restaurantRouter = new Hono<HonoVariables>()
    .get('/mine', getMyRestaurants)
    .post('/',
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
