import { Hono } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { createRestaurant_SchemaValidator, createRestaurant_Handler } from "./create.controller";

export const restaurantRouter = new Hono<HonoVariables>()
    .post('/create',
        createRestaurant_SchemaValidator,
        createRestaurant_Handler
    )
// .get(
//     '/my_restaurants',
//     getMyRestaurants_Handler
// )
// .patch('/:restaurantId',
//     createAdminCheckRestraurant([
//         TEAM_PERMISSIONS.FULL_ACCESS,
//         TEAM_PERMISSIONS.RESTAURANT_MANAGER
//     ]),
//     updateRestaurant_SchemaValidator,
//     updateRestaurant_Handler
// )
// .post(
//     '/:restaurantId',
//     createAdminCheckRestraurant([
//         TEAM_PERMISSIONS.FULL_ACCESS,
//         TEAM_PERMISSIONS.RESTAURANT_MANAGER
//     ]),
//     restaurant_SchemaValidator,
//     restaurant_Handler
// )
// .route('/:restaurantId/address', addressRouter)
// .route('/:restaurantId/open_hours', openHoursRouter)
// .route('/:restaurantId/menu', menuRouter)
// .route('/:restaurantId/payment_methods', paymentMethodsRouter)
// .route('/:restaurantId/table_reservation_settings', tableReservationSettingsRouter)
// .route('/:restaurantId/tax_settings', taxSettingsRouter)
// .route('/:restaurantId/scheduled_orders_settings', scheduledOrdersSettingsRouter)
// .route('/:restaurantId/delivery_zones', deliveryZonesRouter); 