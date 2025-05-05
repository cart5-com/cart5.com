import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { acceptOrder_Service } from '@db/services/order.service';
import { sendNotificationToStore } from "./listen_store.controller";

export const acceptOrder_SchemaValidator = zValidator('json', z.object({
    orderId: z.string(),
}));

export const acceptOrder_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/accept_order",
    ValidatorContext<typeof acceptOrder_SchemaValidator>
>) => {

    const acceptedOrderResult = await acceptOrder_Service(
        c.req.param('storeId'),
        c.req.valid('json').orderId
    )
    if (acceptedOrderResult.rowsAffected === 1) {
        sendNotificationToStore(c.req.param('storeId'), {
            orderId: c.req.valid('json').orderId
        });
    }
    return c.json({
        data: acceptedOrderResult.rowsAffected,
        error: null as ErrorType
    }, 200);
}
