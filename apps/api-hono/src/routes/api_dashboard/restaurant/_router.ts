import { Hono } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { createRestaurant_SchemaValidator, createRestaurant_Handler } from "./create.controller";
import { getMyRestaurants_Handler } from "./my_restaurants.controller";
import { getRestaurant_SchemaValidator, getRestaurant_Handler } from "./get.controller";
import { updateRestaurant_SchemaValidator, updateRestaurant_Handler } from "./update.controller";
import { getRestaurantAddress_SchemaValidator, getRestaurantAddress_Handler } from "./address_get.controller";
import { updateRestaurantAddress_SchemaValidator, updateRestaurantAddress_Handler } from "./address_update.controller";
import { getRestaurantOpenHours_SchemaValidator, getRestaurantOpenHours_Handler } from "./open_hours_get.controller";
import { updateRestaurantOpenHours_SchemaValidator, updateRestaurantOpenHours_Handler } from "./open_hours_update.controller";
import { getRestaurantMenu_SchemaValidator, getRestaurantMenu_Handler } from "./menu_get.controller";
import { updateRestaurantMenu_SchemaValidator, updateRestaurantMenu_Handler } from "./menu_update.controller";
import { getRestaurantPaymentMethods_SchemaValidator, getRestaurantPaymentMethods_Handler } from "./payment_methods_get.controller";
import { updateRestaurantPaymentMethods_SchemaValidator, updateRestaurantPaymentMethods_Handler } from "./payment_methods_update.controller";
import { getRestaurantTableReservationSettings_SchemaValidator, getRestaurantTableReservationSettings_Handler } from "./table_reservation_settings_get.controller";
import { updateRestaurantTableReservationSettings_SchemaValidator, updateRestaurantTableReservationSettings_Handler } from "./table_reservation_settings_update.controller";
import { createAdminCheckRestraurant } from "@api-hono/utils/checkRestaurantPermissions";
import { TEAM_PERMISSIONS } from "@lib/consts";

export const restaurantRouter = new Hono<HonoVariables>()
    .get(
        '/my_restaurants',
        getMyRestaurants_Handler
    )
    .post('/create',
        createRestaurant_SchemaValidator,
        createRestaurant_Handler
    )
    .post('/:restaurantId',
        createAdminCheckRestraurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        getRestaurant_SchemaValidator,
        getRestaurant_Handler
    )
    .patch('/:restaurantId',
        createAdminCheckRestraurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        updateRestaurant_SchemaValidator,
        updateRestaurant_Handler
    )
    .post('/:restaurantId/address/get',
        createAdminCheckRestraurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        getRestaurantAddress_SchemaValidator,
        getRestaurantAddress_Handler
    )
    .patch('/:restaurantId/address/update',
        createAdminCheckRestraurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        updateRestaurantAddress_SchemaValidator,
        updateRestaurantAddress_Handler
    )
    .post('/:restaurantId/open_hours/get',
        createAdminCheckRestraurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        getRestaurantOpenHours_SchemaValidator,
        getRestaurantOpenHours_Handler
    )
    .patch('/:restaurantId/open_hours/update',
        createAdminCheckRestraurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        updateRestaurantOpenHours_SchemaValidator,
        updateRestaurantOpenHours_Handler
    )
    .post('/:restaurantId/menu/get',
        createAdminCheckRestraurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        getRestaurantMenu_SchemaValidator,
        getRestaurantMenu_Handler
    )
    .patch('/:restaurantId/menu/update',
        createAdminCheckRestraurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        updateRestaurantMenu_SchemaValidator,
        updateRestaurantMenu_Handler
    )
    .post('/:restaurantId/payment_methods/get',
        createAdminCheckRestraurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        getRestaurantPaymentMethods_SchemaValidator,
        getRestaurantPaymentMethods_Handler
    )
    .patch('/:restaurantId/payment_methods/update',
        createAdminCheckRestraurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        updateRestaurantPaymentMethods_SchemaValidator,
        updateRestaurantPaymentMethods_Handler
    )
    .post('/:restaurantId/table_reservation_settings/get',
        createAdminCheckRestraurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        getRestaurantTableReservationSettings_SchemaValidator,
        getRestaurantTableReservationSettings_Handler
    )
    .patch('/:restaurantId/table_reservation_settings/update',
        createAdminCheckRestraurant([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]),
        updateRestaurantTableReservationSettings_SchemaValidator,
        updateRestaurantTableReservationSettings_Handler
    )
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