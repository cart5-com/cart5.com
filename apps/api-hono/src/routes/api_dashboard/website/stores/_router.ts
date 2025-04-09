import { Hono } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { TEAM_PERMISSIONS } from "@lib/consts";
import { checkWebsitePermissions } from "@api-hono/utils/checkWebsitePermissions";
import { listStores_Handler, listStores_SchemaValidator } from "./list.controller";
import { upsertStore_Handler, upsertStore_SchemaValidator } from "./upsert.controller";
import { removeStore_Handler, removeStore_SchemaValidator } from "./remove.controller";

export const storesRouter = new Hono<HonoVariables>()
    .get(
        '/list',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ]),
        listStores_SchemaValidator,
        listStores_Handler
    )
    .post(
        '/upsert',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ]),
        upsertStore_SchemaValidator,
        upsertStore_Handler
    )
    .post(
        '/remove',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ]),
        removeStore_SchemaValidator,
        removeStore_Handler
    ); 