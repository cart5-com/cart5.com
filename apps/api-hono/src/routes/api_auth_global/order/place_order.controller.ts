import { type Context } from 'hono'
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { generateOrderData_Service, updateOrderData_Service } from '@db/services/order.service';
import { generateKey } from '@lib/utils/generateKey';
import { generateCartId } from '@lib/utils/generateCartId';
import { updateUserData_Service } from '@db/services/user_data.service';
import { sendNotificationToStore } from '@api-hono/routes/api_orders/listen_store.controller';

export const placeOrderRoute = async (c: Context<
    HonoVariables
>) => {
    const storeId = c.req.param('storeId');
    if (!storeId) {
        throw new KNOWN_ERROR("Store ID not found", "STORE_ID_NOT_FOUND");
    }
    const host = c.req.header()['host'];
    if (!host) {
        throw new KNOWN_ERROR("Host not found", "HOST_NOT_FOUND");
    }
    const origin = c.req.header()['origin'];
    if (!origin) {
        throw new KNOWN_ERROR("Origin not found", "ORIGIN_NOT_FOUND");
    }
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (user.hasVerifiedPhoneNumber === 0) {
        throw new KNOWN_ERROR("User phone number not verified", "USER_PHONE_NUMBER_NOT_VERIFIED");
    }
    const newOrderId = generateKey('ord');
    const { order, carts } = await generateOrderData_Service(user, host, storeId, origin);
    // const ipAddress = c.req.header()['x-forwarded-for'];
    // save order data
    await updateOrderData_Service(newOrderId, order);

    // delete cart current cart
    const cartId = generateCartId(host ?? '', storeId);
    delete carts?.[cartId];
    await updateUserData_Service(user.id, { carts });

    sendNotificationToStore(storeId, {
        orderId: newOrderId
    });
    // TODO: if stripe return checkout url,

    // TODO: send email notification to user once store approves/rejects order
    return c.json({
        data: {
            newOrderId
        },
        error: null as ErrorType
    }, 200);
}