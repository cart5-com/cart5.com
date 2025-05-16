import { Hono } from 'hono'
import { stripe } from '@api-hono/utils/stripe/stripe'
import { getEnvVariable } from '@lib/utils/getEnvVariable'
import { type HonoVariables } from "@api-hono/types/HonoVariables";
import { getOrderData_Service, updateOrderStripeData_Service } from '@db/services/order.service';
import { ORDER_STATUS_OBJ } from '@lib/types/orderStatus';
import { placeOnlinePaymentOrder, processed_online_payment_order_ids } from '../api_auth_global/order/place_online_payment_order';
export const stripeWebhook = new Hono<HonoVariables>()
    // .get(
    //     '/',
    //     async (context) => {
    //         return context.text('stripeWebhook', 200)
    //     }
    // )
    .post(
        '/', //paths.stripe_webhook='/stripe/webhook
        async (context) => {
            const signature = context.req.header('stripe-signature')
            try {
                if (!signature) {
                    return context.text('', 400)
                }
                const body = await context.req.text()
                const event = await stripe.webhooks.constructEventAsync(
                    body,
                    signature,
                    getEnvVariable('STRIPE_WEBHOOK_SECRET')
                )
                switch (event.type) {
                    case 'checkout.session.completed': {
                        const checkoutSessionCompleted = event.data.object;
                        if (!checkoutSessionCompleted.metadata?.orderId) {
                            return context.text("OrderId not found", 400)
                        }
                        const orderId = checkoutSessionCompleted.metadata.orderId;
                        if (processed_online_payment_order_ids[orderId]) {
                            // already processed
                            return context.text('', 200)
                        }
                        const order = await getOrderData_Service(orderId);
                        if (!order) {
                            return context.text("Order not found", 400)
                        }
                        if (order.orderStatus !== ORDER_STATUS_OBJ.PENDING_PAYMENT_AUTHORIZATION) {
                            // already processed
                            return context.text('', 200)
                        }
                        if (
                            order.onlinePaymentFlags &&
                            order.onlinePaymentFlags?.isOnlinePaymentVerified === true
                        ) {
                            // already processed
                            return context.text('', 200)
                        }
                        if (
                            checkoutSessionCompleted.payment_intent &&
                            typeof checkoutSessionCompleted.payment_intent === 'string'
                        ) {
                            await updateOrderStripeData_Service(orderId, {
                                // storeStripeConnectAccountId: checkoutSessionCompleted.metadata.storeStripeConnectAccountId, // not required we already set it in place_order.controller
                                checkoutSessionId: checkoutSessionCompleted.id,
                                paymentIntentId: checkoutSessionCompleted.payment_intent,
                            });
                        }
                        await placeOnlinePaymentOrder(order, orderId, order.userId, 'stripe-webhook', undefined);
                        break
                    }
                    default:
                        break
                }
                return context.text('', 200)
            } catch (err) {
                const errorMessage = `⚠️ Webhook signature verification failed. 
                ${err instanceof Error ? err.message : 'Internal server error⚠️'}`
                console.log(errorMessage)
                return context.text(errorMessage, 400)
            }
        }
    )