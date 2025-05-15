import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { getStoreOrder_forCancel_Service } from '@db/services/order/order.cancel.service';
import { KNOWN_ERROR } from "@lib/types/errors";
import { cancelOrder } from "@api-hono/utils/orders/cancelOrder";

export const cancelOrder_SchemaValidator = zValidator('json', z.object({
    orderId: z.string(),
}));

export const cancelOrder_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/cancel_order",
    ValidatorContext<typeof cancelOrder_SchemaValidator>
>) => {
    const user = c.get("USER");
    const ipAddress = c.req.header()['x-forwarded-for'] || c.req.header()['x-real-ip'];
    const order = await getStoreOrder_forCancel_Service(
        c.req.param('storeId'),
        c.req.valid('json').orderId,
    )
    if (!order) {
        throw new KNOWN_ERROR("Order not found", "ORDER_NOT_FOUND");
    } else {
        await cancelOrder(order, user?.id, ipAddress, 'user');
    }
    return c.json({
        data: 'cancelled',
        error: null as ErrorType
    }, 200);
}
