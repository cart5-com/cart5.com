import { Hono } from "hono";
import type { HonoVariables } from '../../../hono/HonoVariables';
import { restaurantAdminCheck } from "../restaurant/restaurant.admin.check";
import { getPaymentMethods_Handler, getPaymentMethods_SchemaValidator } from "./get/restaurant.payment_methods.get.handler";
import { updatePaymentMethods_Handler, updatePaymentMethods_SchemaValidator } from "./update/restaurant.payment_methods.update.handler";

export const paymentMethodsRouter = new Hono<HonoVariables>()
    .use(restaurantAdminCheck)
    .post('/get',
        getPaymentMethods_SchemaValidator,
        getPaymentMethods_Handler
    )
    .patch('/update',
        updatePaymentMethods_SchemaValidator,
        updatePaymentMethods_Handler
    ); 