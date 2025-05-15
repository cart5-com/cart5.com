import { cancelOrder_Service } from "@db/services/order.service";
import { getCreated_butNotAcceptedOrders_after25Minutes_Service } from "@db/services/order/order.cancel.service";
import { cancelPaymentIntent_inStripeConnectedAccount } from "../stripe/cancelPaymentIntent_inStripeConnectedAccount";
import { refundCreate_inStripeConnectedAccount } from "../stripe/refundCreate_inStripeConnectedAccount";
import type { OrderStatusChangedByType } from "@lib/types/orderStatusChangedByEnum";
import { sendNotificationToStore } from "@api-hono/routes/api_orders/listen_store.controller";

export const cancelOldOrders_AbandonedByStore = async () => {
    const orders = await getCreated_butNotAcceptedOrders_after25Minutes_Service();
    for (const order of orders) {
        await cancelOldOrders_AbandonedByStore_Handler(order);
    }
}

export const cancelOldOrders_AbandonedByStore_Handler = async (
    order: Awaited<ReturnType<typeof getCreated_butNotAcceptedOrders_after25Minutes_Service>>[number],
    userId?: string,
    ipAddress?: string,
    orderStatusChangedBy: OrderStatusChangedByType = 'system',
) => {
    let cancelledOrderResult: Awaited<ReturnType<typeof cancelOrder_Service>>;
    if (
        order.isOnlinePaymentVerified &&
        order.paymentId === 'stripe' &&
        order.stripeData &&
        (order.stripeData.checkoutSessionId || order.stripeData.paymentIntentId)
    ) {
        // if online payment, cancel payment intent (or refund if already captured)
        if (order.isOnlinePaymentCaptured !== true) {
            await cancelPaymentIntent_inStripeConnectedAccount(
                order.orderId,
                order.stripeData.checkoutSessionId,
                order.stripeData.paymentIntentId,
                order.stripeData.storeStripeConnectAccountId
            );
        } else {
            await refundCreate_inStripeConnectedAccount(
                order.orderId,
                order.stripeData.checkoutSessionId,
                order.stripeData.paymentIntentId,
                order.stripeData.storeStripeConnectAccountId
            );
        }
        cancelledOrderResult = await cancelOrder_Service(order.storeId, order.orderId, userId, ipAddress, orderStatusChangedBy, true);

        // slow down to avoid rate limits. max 100 per second
        // You can request a limit increase to enable a high-traffic application by contacting Stripe Support. If you’re requesting a large increase, contact us at least 6 weeks in advance.
        // 50 ms sleep means max 20 per seconds
        // https://docs.stripe.com/rate-limits#rate-limiter
        await new Promise(resolve => setTimeout(resolve, 50));
    } else {
        // if not online payment, cancel the order
        cancelledOrderResult = await cancelOrder_Service(order.storeId, order.orderId, userId, ipAddress, orderStatusChangedBy);
    }
    if (cancelledOrderResult.rowsAffected === 1) {
        sendNotificationToStore(order.storeId, {
            orderId: order.orderId
        });
    }
}