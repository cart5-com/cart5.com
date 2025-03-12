import { Hono } from "hono";
import type { HonoVariables } from '../../../hono/HonoVariables';
import { restaurantAdminCheck } from "../restaurant/restaurant.admin.check";
import { getDeliveryZones_Handler, getDeliveryZones_SchemaValidator } from "./get/restaurant.delivery_zones.get.handler";
import { updateDeliveryZones_Handler, updateDeliveryZones_SchemaValidator } from "./update/restaurant.delivery_zones.update.handler";

export const deliveryZonesRouter = new Hono<HonoVariables>()
    .use(restaurantAdminCheck)
    .post('/get',
        getDeliveryZones_SchemaValidator,
        getDeliveryZones_Handler
    )
    .patch('/update',
        updateDeliveryZones_SchemaValidator,
        updateDeliveryZones_Handler
    ); 