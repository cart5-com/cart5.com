import { Hono } from 'hono';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { listenStore_Handler } from './listen_store.controller';
import { TEAM_PERMISSIONS } from '@lib/consts';
import { createAdminCheckStore } from '@api-hono/utils/checkStorePermissions';
import { mustHaveUser } from '@api-hono/middlewares/mustHaveUser';
import { getRecentOrders_Route } from '@api-hono/routes/api_orders/get_recent_orders.controller';
import { getStoreOrders_Handler, getStoreOrders_SchemaValidator } from '@api-hono/routes/api_orders/store_orders.controller';
import { acceptOrder_Handler, acceptOrder_SchemaValidator } from './accept_order.controller';
import { completeOrder_Handler, completeOrder_SchemaValidator } from './complete_order.controller';
import { cancelOrder_Handler, cancelOrder_SchemaValidator } from './cancel_order.controller';
import { pairAutoprintDevice_Handler, pairAutoprintDevice_SchemaValidator } from './pair_autoprint_device.controller';
import { getMyOrderStores_Handler } from './my_order_stores.controller';


export const apiOrders = new Hono<HonoVariables>()
    .use(mustHaveUser)
    .get(
        '/my_order_stores',
        getMyOrderStores_Handler
    )
    .get(
        '/:storeId/listen',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER,
            TEAM_PERMISSIONS.ORDERS_MANAGER
        ]),
        listenStore_Handler
    )
    .get(
        '/:storeId/recent_orders',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER,
            TEAM_PERMISSIONS.ORDERS_MANAGER
        ]),
        getRecentOrders_Route
    )
    .post(
        '/:storeId/get_by_order_ids',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER,
            TEAM_PERMISSIONS.ORDERS_MANAGER
        ]),
        getStoreOrders_SchemaValidator,
        getStoreOrders_Handler
    )
    .post(
        '/:storeId/accept_order',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER,
            TEAM_PERMISSIONS.ORDERS_MANAGER
        ]),
        acceptOrder_SchemaValidator,
        acceptOrder_Handler
    )
    .post(
        '/:storeId/complete_order',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER,
            TEAM_PERMISSIONS.ORDERS_MANAGER
        ]),
        completeOrder_SchemaValidator,
        completeOrder_Handler
    )
    .post(
        '/:storeId/cancel_order',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER,
            TEAM_PERMISSIONS.ORDERS_MANAGER
        ]),
        cancelOrder_SchemaValidator,
        cancelOrder_Handler
    )
    .post(
        '/:storeId/pair_autoprint_device',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER,
            TEAM_PERMISSIONS.ORDERS_MANAGER
        ]),
        pairAutoprintDevice_SchemaValidator,
        pairAutoprintDevice_Handler
    )

export type ApiOrdersType = typeof apiOrders;


