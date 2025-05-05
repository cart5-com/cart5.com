import { Hono } from 'hono';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { listenStore_Handler } from './listen_store.controller';
import { TEAM_PERMISSIONS } from '@lib/consts';
import { createAdminCheckStore } from '@api-hono/utils/checkStorePermissions';
import { mustHaveUser } from '@api-hono/middlewares/mustHaveUser';
import { getRecentOrders_Route } from '@api-hono/routes/api_orders/get_recent_orders.controller';
import { getStoreOrders_Handler, getStoreOrders_SchemaValidator } from '@api-hono/routes/api_orders/store_orders.controller';
import { acceptOrder_Handler, acceptOrder_SchemaValidator } from './accept_order.controller';
export const apiOrders = new Hono<HonoVariables>()
    .use(mustHaveUser)
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
export type ApiOrdersType = typeof apiOrders;


