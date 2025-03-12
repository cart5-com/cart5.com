import { Hono } from "hono";
import type { HonoVariables } from '../../../hono/HonoVariables';
import { restaurantAdminCheck } from "../restaurant/restaurant.admin.check";
import { getAddress_Handler, getAddress_SchemaValidator } from "./get/restaurant.address.get.handler";
import { updateAddress_Handler, updateAddress_SchemaValidator } from "./update/restaurant.address.update.handler";

export const addressRouter = new Hono<HonoVariables>()
    .use(restaurantAdminCheck)
    .post('/get',
        getAddress_SchemaValidator,
        getAddress_Handler
    )
    .patch('/update',
        updateAddress_SchemaValidator,
        updateAddress_Handler
    ); 