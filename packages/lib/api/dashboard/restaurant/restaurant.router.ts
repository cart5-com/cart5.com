import { Hono } from "hono"
import type { HonoVariables } from "../../../hono/HonoVariables"
import { createRestaurant_Handler, createRestaurant_SchemaValidator } from './create/restaurant.create.handler'
import { updateRestaurant_Handler, updateRestaurant_SchemaValidator } from './update/restaurant.update.handler'
import { getRestaurant_Handler, getRestaurant_SchemaValidator } from './get/restaurant.get.handler'
import { getMyRestaurants_Handler } from "./my_restaurants/restaurant.my_restaurants.handler"
import { restaurantAdminCheck } from "./restaurant.admin.check"
import { addressRouter } from "../restaurant_address/restaurant.address.router"
import { openHoursRouter } from "../restaurant_open_hours/restaurant.open_hours.router"
import { menuRouter } from "../restaurant_menu/restaurant.menu.router"
import { paymentMethodsRouter } from "../restaurant_payment_methods/restaurant.payment_methods.router"
import { tableReservationSettingsRouter } from "../restaurant_table_reservation_settings/restaurant.table_reservation_settings.router"
import { taxSettingsRouter } from "../restaurant_tax_settings/restaurant.tax_settings.router"
import { scheduledOrdersSettingsRouter } from "../restaurant_scheduled_orders_settings/restaurant.scheduled_orders_settings.router"
import { deliveryZonesRouter } from "../restaurant_delivery_zones/restaurant.delivery_zones.router"

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
    )
    .route('/:restaurantId/address', addressRouter)
    .route('/:restaurantId/open_hours', openHoursRouter)
    .route('/:restaurantId/menu', menuRouter)
    .route('/:restaurantId/payment_methods', paymentMethodsRouter)
    .route('/:restaurantId/table_reservation_settings', tableReservationSettingsRouter)
    .route('/:restaurantId/tax_settings', taxSettingsRouter)
    .route('/:restaurantId/scheduled_orders_settings', scheduledOrdersSettingsRouter)
    .route('/:restaurantId/delivery_zones', deliveryZonesRouter); 