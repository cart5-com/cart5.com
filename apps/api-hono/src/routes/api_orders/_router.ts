import { Hono } from 'hono';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { notifyStore_Handler } from './notify/notify_store.controller';
import { TEAM_PERMISSIONS } from '@lib/consts';
import { createAdminCheckStore } from '@api-hono/utils/checkStorePermissions';

export const apiOrders = new Hono<HonoVariables>()
    .get(
        '/:storeId/notify',
        createAdminCheckStore([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.STORE_MANAGER
        ]),
        notifyStore_Handler
    )

export type ApiOrdersType = typeof apiOrders;


