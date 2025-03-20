import { Hono } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { TEAM_PERMISSIONS } from "@lib/consts";
import { checkWebsitePermissions } from "@api-hono/utils/checkWebsitePermissions";
import { listRestaurants_Handler, listRestaurants_SchemaValidator } from "./list.controller";
import { addRestaurant_Handler, addRestaurant_SchemaValidator } from "./add.controller";
import { removeRestaurant_Handler, removeRestaurant_SchemaValidator } from "./remove.controller";

export const restaurantsRouter = new Hono<HonoVariables>()
    .get(
        '/list',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ]),
        listRestaurants_SchemaValidator,
        listRestaurants_Handler
    )
    .post(
        '/add',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ]),
        addRestaurant_SchemaValidator,
        addRestaurant_Handler
    )
    .post(
        '/remove',
        checkWebsitePermissions([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ]),
        removeRestaurant_SchemaValidator,
        removeRestaurant_Handler
    ); 