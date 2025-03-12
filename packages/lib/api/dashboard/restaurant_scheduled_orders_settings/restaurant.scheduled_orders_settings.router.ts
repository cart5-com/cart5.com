import { Hono } from "hono";
import type { HonoVariables } from '../../../hono/HonoVariables';
import { restaurantAdminCheck } from "../restaurant/restaurant.admin.check";
import { getScheduledOrdersSettings_Handler, getScheduledOrdersSettings_SchemaValidator } from "./get/restaurant.scheduled_orders_settings.get.handler";
import { updateScheduledOrdersSettings_Handler, updateScheduledOrdersSettings_SchemaValidator } from "./update/restaurant.scheduled_orders_settings.update.handler";

export const scheduledOrdersSettingsRouter = new Hono<HonoVariables>()
    .use(restaurantAdminCheck)
    .post('/get',
        getScheduledOrdersSettings_SchemaValidator,
        getScheduledOrdersSettings_Handler
    )
    .patch('/update',
        updateScheduledOrdersSettings_SchemaValidator,
        updateScheduledOrdersSettings_Handler
    ); 