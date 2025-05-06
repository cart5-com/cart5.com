import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { completeOrder_Service } from '@db/services/order.service';
import { sendNotificationToStore } from "./listen_store.controller";

export const completeOrder_SchemaValidator = zValidator('json', z.object({
    orderId: z.string(),
}));

export const completeOrder_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/complete_order",
    ValidatorContext<typeof completeOrder_SchemaValidator>
>) => {

    const completedOrderResult = await completeOrder_Service(
        c.req.param('storeId'),
        c.req.valid('json').orderId
    )
    if (completedOrderResult.rowsAffected === 1) {
        sendNotificationToStore(c.req.param('storeId'), {
            orderId: c.req.valid('json').orderId
        });
    }
    return c.json({
        data: completedOrderResult.rowsAffected,
        error: null as ErrorType
    }, 200);
}
