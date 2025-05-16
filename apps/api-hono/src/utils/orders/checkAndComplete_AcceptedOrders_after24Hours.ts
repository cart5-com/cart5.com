import {
    getAcceptedOrders_toCheckAndComplete_after24Hours_Service,
    completeOrder_Service
} from "@db/services/order/order.auto_complete.service";
import { capturePaymentIntent_inStripeConnectedAccount } from "../stripe/capturePaymentIntent_inStripeConnectedAccount";
import { IS_PROD } from "@lib/utils/getEnvVariable";

export const checkAndComplete_AcceptedOrders_after24Hours = async () => {
    const message = "Checking and completing accepted orders after 24 hours";
    console.log(`'${message}' started`);
    console.time(message);
    const orders = await getAcceptedOrders_toCheckAndComplete_after24Hours_Service();
    for (const order of orders) {
        if (
            order.onlinePaymentFlags &&
            order.onlinePaymentFlags.isOnlinePaymentVerified === true &&
            order.paymentId === 'stripe' &&
            order.stripeData &&
            (order.stripeData.checkoutSessionId || order.stripeData.paymentIntentId) &&
            order.onlinePaymentFlags && order.onlinePaymentFlags.isOnlinePaymentCaptured !== true
        ) {
            // if online payment, capture the payment and complete the order
            try {
                await capturePaymentIntent_inStripeConnectedAccount(
                    order.orderId,
                    order.stripeData.checkoutSessionId,
                    order.stripeData.paymentIntentId,
                    order.stripeData.storeStripeConnectAccountId
                );
                await completeOrder_Service(order.orderId, true);

                // slow down to avoid rate limits. max 100 per second
                // You can request a limit increase to enable a high-traffic application by contacting Stripe Support. If you’re requesting a large increase, contact us at least 6 weeks in advance.
                // 50 ms sleep means max 20 per seconds
                // https://docs.stripe.com/rate-limits#rate-limiter
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (error) {
                console.error(`Error capturing payment intent for order ${order.orderId}`);
                console.error(error);
                if (IS_PROD) {
                    globalThis.globalSentry?.captureException(error, {
                        data: {
                            orderId: order.orderId,
                            checkoutSessionId: order.stripeData.checkoutSessionId,
                            paymentIntentId: order.stripeData.paymentIntentId,
                            storeStripeConnectAccountId: order.stripeData.storeStripeConnectAccountId,
                        }
                    });
                }
            }
        } else {
            // if not online payment, complete the order
            await completeOrder_Service(order.orderId);
        }
    }
    console.timeEnd(message);
}
