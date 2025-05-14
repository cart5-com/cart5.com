import { KNOWN_ERROR } from '@lib/types/errors';
import { getStoreAutomationRules_Service } from '@db/services/store.service';
import { saveOrderAfterStipePaymentVerification_Service } from '@db/services/order.transactional.service';
import { ORDER_STATUS_OBJ } from '@lib/types/orderStatus';
import { sendNotificationToStore } from '@api-hono/routes/api_orders/listen_store.controller';
import { getOrderData_Service } from '@db/services/order.service';

export const processed_online_payment_order_ids: Record<string, boolean> = {};

export const placeOnlineOrder = async (
    orderId: string,
    userId: string,
    ipAddress?: string,
    locale?: string,
    order?: Awaited<ReturnType<typeof getOrderData_Service>>
) => {
    if (!order) {
        throw new KNOWN_ERROR("Order not found", "ORDER_NOT_FOUND");
    }
    order.orderStatus = ORDER_STATUS_OBJ.CREATED;
    order.isOnlinePaymentVerified = true;
    order.created_at_ts = Date.now();
    if (processed_online_payment_order_ids[orderId]) {
        // no need to process again
        return order;
    }
    const storeAutomationRules = await getStoreAutomationRules_Service(order.storeId, {
        autoAcceptOrders: true,
        autoPrintRules: true
    });
    await saveOrderAfterStipePaymentVerification_Service(
        orderId,
        order,
        {
            newStatus: order.orderStatus,
            changedByUserId: userId,
            changedByIpAddress: ipAddress,
            type: (ipAddress === 'stripe-webhook') ? 'stripe-webhook' : 'user',
        },
        (storeAutomationRules?.autoAcceptOrders) ?
            {
                storeId: order.storeId,
                changedByUserId: undefined,
                changedByIpAddress: undefined,
                type: 'automatic_rule'
            }
            :
            undefined,
        (storeAutomationRules?.autoPrintRules) ?
            {
                storeId: order.storeId,
                autoPrintRules: storeAutomationRules.autoPrintRules
            }
            :
            undefined,
        locale
    );
    processed_online_payment_order_ids[orderId] = true;
    sendNotificationToStore(order.storeId, {
        orderId
    });
    return order;
}