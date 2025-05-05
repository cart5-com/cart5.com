import { Hono } from 'hono';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { listenStore_Handler } from './listen/listen_store.controller';
import { TEAM_PERMISSIONS } from '@lib/consts';
import { createAdminCheckStore } from '@api-hono/utils/checkStorePermissions';
import { mustHaveUser } from '@api-hono/middlewares/mustHaveUser';
import { getRecentOrders_Route } from '@api-hono/routes/api_orders/get_recent_orders.controller';

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

export type ApiOrdersType = typeof apiOrders;


