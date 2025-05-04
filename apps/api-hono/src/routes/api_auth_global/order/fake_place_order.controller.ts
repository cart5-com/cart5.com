import { type Context } from 'hono'
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { generateKey } from '@lib/utils/generateKey';
import { sendNotifyToStore } from '@api-hono/routes/api_orders/notify/notify_store.controller';

export const fakePlaceOrderRoute = async (c: Context<
    HonoVariables
>) => {
    const storeId = c.req.param('storeId');
    if (!storeId) {
        throw new KNOWN_ERROR("Store ID not found", "STORE_ID_NOT_FOUND");
    }
    const newOrderId = generateKey('ord');
    sendNotifyToStore(storeId, {
        type: 'order_placed',
        orderId: newOrderId
    });
    return c.json({
        data: {
            newOrderId
        },
        error: null as ErrorType
    }, 200);
}