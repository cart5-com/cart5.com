import { Hono } from "hono";
import type { HonoVariables } from '../../../hono/HonoVariables';
import { restaurantAdminCheck } from "../restaurant/restaurant.admin.check";
import { getTaxSettings_Handler, getTaxSettings_SchemaValidator } from "./get/restaurant.tax_settings.get.handler";
import { updateTaxSettings_Handler, updateTaxSettings_SchemaValidator } from "./update/restaurant.tax_settings.update.handler";

export const taxSettingsRouter = new Hono<HonoVariables>()
    .use(restaurantAdminCheck)
    .post('/get',
        getTaxSettings_SchemaValidator,
        getTaxSettings_Handler
    )
    .patch('/update',
        updateTaxSettings_SchemaValidator,
        updateTaxSettings_Handler
    ); 