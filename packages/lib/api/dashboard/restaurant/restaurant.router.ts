import { Hono } from "hono"
import type { HonoVariables } from "../../../hono/HonoVariables"
import { createRestaurant_Handler, createRestaurant_SchemaValidator } from './create/restaurant.create.handler'
import { updateRestaurant_Handler, updateRestaurant_SchemaValidator } from './update/restaurant.update.handler'
import { getRestaurant_Handler, getRestaurant_SchemaValidator } from './get/restaurant.get.handler'
import { getMyRestaurants_Handler } from "./my_restaurants/restaurant.my_restaurants.handler"
import { restaurantAdminCheck } from "./restaurant.admin.check"

export const restaurantRouter = new Hono<HonoVariables>()
    .get(
        '/my_restaurants',
        getMyRestaurants_Handler
    )
    .post('/create',
        createRestaurant_SchemaValidator,
        createRestaurant_Handler
    )
    .patch('/:restaurantId',
        restaurantAdminCheck,
        updateRestaurant_SchemaValidator,
        updateRestaurant_Handler
    )
    .post(
        '/:restaurantId',
        restaurantAdminCheck,
        getRestaurant_SchemaValidator,
        getRestaurant_Handler
    ); 