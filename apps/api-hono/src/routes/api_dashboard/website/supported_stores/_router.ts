import { Hono } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { TEAM_PERMISSIONS } from "@lib/consts";
import { checkWebsitePermissions } from "@api-hono/utils/checkWebsitePermissions";
import { listSupportedStores_Handler, listSupportedStores_SchemaValidator } from "./list.controller";
import { upsertSupportedStore_Handler, upsertSupportedStore_SchemaValidator } from "./upsert.controller";

export const supportedStoresRouter = new Hono<HonoVariables>()
    .get(
        '/list',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ]),
        listSupportedStores_SchemaValidator,
        listSupportedStores_Handler
    )
    .post(
        '/upsert',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ]),
        upsertSupportedStore_SchemaValidator,
        upsertSupportedStore_Handler
    )