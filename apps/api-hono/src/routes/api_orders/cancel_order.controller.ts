import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { cancelOrder_Service } from '@db/services/order.service';
import { sendNotificationToStore } from "./listen_store.controller";

export const cancelOrder_SchemaValidator = zValidator('json', z.object({
    orderId: z.string(),
}));

export const cancelOrder_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/cancel_order",
    ValidatorContext<typeof cancelOrder_SchemaValidator>
>) => {

    const cancelledOrderResult = await cancelOrder_Service(
        c.req.param('storeId'),
        c.req.valid('json').orderId
    )
    if (cancelledOrderResult.rowsAffected === 1) {
        sendNotificationToStore(c.req.param('storeId'), {
            orderId: c.req.valid('json').orderId
        });
    }
    return c.json({
        data: cancelledOrderResult.rowsAffected,
        error: null as ErrorType
    }, 200);
}
