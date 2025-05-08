import { type Context } from 'hono'
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { generateOrderData_Service, updateOrderData_Service, logOrderStatusChange_Service, acceptOrder_Service } from '@db/services/order.service';
import { generateKey } from '@lib/utils/generateKey';
import { generateCartId } from '@lib/utils/generateCartId';
import { updateUserData_Service } from '@db/services/user_data.service';
import { sendNotificationToStore } from '@api-hono/routes/api_orders/listen_store.controller';
import { ORDER_STATUS_OBJ } from '@lib/types/orderStatus';
import { getStoreAutomationRules_Service } from '@db/services/store.service';

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
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (user.hasVerifiedPhoneNumber === 0) {
        throw new KNOWN_ERROR("User phone number not verified", "USER_PHONE_NUMBER_NOT_VERIFIED");
    }
    const newOrderId = generateKey('ord');
    const { order, carts } = await generateOrderData_Service(user, host, storeId);
    const ipAddress = c.req.header()['x-forwarded-for'] || c.req.header()['x-real-ip'];

    // TODO: if stripe return checkout url, make status 'PENDING_PAYMENT_AUTHORIZATION'
    // save order data TODO: use transaction for saving..
    await updateOrderData_Service(newOrderId, order);

    // Log the initial order creation status
    await logOrderStatusChange_Service({
        orderId: newOrderId,
        newStatus: ORDER_STATUS_OBJ.CREATED,
        changedByUserId: user.id,
        changedByIpAddress: ipAddress,
        type: 'user',
    });

    // delete cart current cart
    const cartId = generateCartId(host ?? '', storeId);
    delete carts?.[cartId];
    await updateUserData_Service(user.id, { carts });

    sendNotificationToStore(storeId, {
        orderId: newOrderId
    });
    const storeAutomationRules = await getStoreAutomationRules_Service(storeId, {
        autoAcceptOrders: true,
    });
    if (storeAutomationRules?.autoAcceptOrders) {
        await acceptOrder_Service(storeId, newOrderId, undefined, undefined, 'automatic_rule');
    }

    // TODO: send email notification to user once store approves/rejects order
    return c.json({
        data: {
            newOrderId
        },
        error: null as ErrorType
    }, 200);
}