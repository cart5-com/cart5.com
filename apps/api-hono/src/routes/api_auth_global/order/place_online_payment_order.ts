import { KNOWN_ERROR } from '@lib/types/errors';
import { saveOrderAfterStipePaymentVerification_Service } from '@db/services/order.transactional.service';
import { ORDER_STATUS_OBJ } from '@lib/types/orderStatus';
import { getOrderData_Service } from '@db/services/order.service';
import { newOrderPlaced_Automations_handler } from '@api-hono/utils/orders/newOrderPlaced_Automations_handler';

export const processed_online_payment_order_ids: Record<string, boolean> = {};

export const placeOnlinePaymentOrder = async (
    order: Awaited<ReturnType<typeof getOrderData_Service>>,
    orderId: string,
    userId: string,
    ipAddress?: string,
    locale?: string,
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
    processed_online_payment_order_ids[orderId] = true;
    await saveOrderAfterStipePaymentVerification_Service(
        orderId,
        {
            newStatus: order.orderStatus,
            changedByUserId: userId,
            changedByIpAddress: ipAddress,
            type: (ipAddress === 'stripe-webhook') ? 'stripe-webhook' : 'user',
        }
    );
    await newOrderPlaced_Automations_handler(
        order,
        order.storeId,
        orderId,
        locale
    );
    return order;
}