import { Hono } from "hono";
import type { HonoVariables } from '../../../hono/HonoVariables';
import { restaurantAdminCheck } from "../restaurant/restaurant.admin.check";
import { getTableReservationSettings_Handler, getTableReservationSettings_SchemaValidator } from "./get/restaurant.table_reservation_settings.get.handler";
import { updateTableReservationSettings_Handler, updateTableReservationSettings_SchemaValidator } from "./update/restaurant.table_reservation_settings.update.handler";

export const tableReservationSettingsRouter = new Hono<HonoVariables>()
    .use(restaurantAdminCheck)
    .post('/get',
        getTableReservationSettings_SchemaValidator,
        getTableReservationSettings_Handler
    )
    .patch('/update',
        updateTableReservationSettings_SchemaValidator,
        updateTableReservationSettings_Handler
    ); 