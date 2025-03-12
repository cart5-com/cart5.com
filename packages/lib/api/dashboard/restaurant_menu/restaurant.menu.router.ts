import { Hono } from "hono";
import type { HonoVariables } from '../../../hono/HonoVariables';
import { restaurantAdminCheck } from "../restaurant/restaurant.admin.check";
import { getMenu_Handler, getMenu_SchemaValidator } from "./get/restaurant.menu.get.handler";
import { updateMenu_Handler, updateMenu_SchemaValidator } from "./update/restaurant.menu.update.handler";

export const menuRouter = new Hono<HonoVariables>()
    .use(restaurantAdminCheck)
    .post('/get',
        getMenu_SchemaValidator,
        getMenu_Handler
    )
    .patch('/update',
        updateMenu_SchemaValidator,
        updateMenu_Handler
    ); 