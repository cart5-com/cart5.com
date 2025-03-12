import { Hono } from "hono";
import type { HonoVariables } from '../../../hono/HonoVariables';
import { restaurantAdminCheck } from "../restaurant/restaurant.admin.check";
import { getOpenHours_Handler, getOpenHours_SchemaValidator } from "./get/restaurant.open_hours.get.handler";
import { updateOpenHours_Handler, updateOpenHours_SchemaValidator } from "./update/restaurant.open_hours.update.handler";

export const openHoursRouter = new Hono<HonoVariables>()
    .use(restaurantAdminCheck)
    .post('/get',
        getOpenHours_SchemaValidator,
        getOpenHours_Handler
    )
    .patch('/update',
        updateOpenHours_SchemaValidator,
        updateOpenHours_Handler
    ); 