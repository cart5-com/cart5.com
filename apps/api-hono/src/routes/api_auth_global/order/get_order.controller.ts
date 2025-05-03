import { type Context } from 'hono'
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { getOrderData_Service } from '@db/services/order.service';

export const getOrderRoute = async (c: Context<
    HonoVariables
>) => {
    const orderId = c.req.param('orderId');
    if (!orderId) {
        throw new KNOWN_ERROR("Order ID not found", "ORDER_ID_NOT_FOUND");
    }
    const host = c.req.header()['host'];
    if (!host) {
        throw new KNOWN_ERROR("Host not found", "HOST_NOT_FOUND");
    }
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }

    const order = await getOrderData_Service(orderId);
    if (!order) {
        throw new KNOWN_ERROR("Order not found", "ORDER_NOT_FOUND");
    }
    if (order.userId !== user.id) {
        throw new KNOWN_ERROR("Permission denied", "PERMISSION_DENIED");
    }
    return c.json({
        data: order,
        error: null as ErrorType
    }, 200);
}