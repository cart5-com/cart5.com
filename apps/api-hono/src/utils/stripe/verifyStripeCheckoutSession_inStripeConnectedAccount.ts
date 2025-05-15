import { KNOWN_ERROR, type ErrorType } from "@lib/types/errors";
import {
    getUserOrderData_Service,
    getOrderStripeData_Service,
    updateOrderStripeData_Service
} from "@db/services/order.service";
import { stripe } from "./stripe";
import type { Stripe } from "stripe";

type orderType = Awaited<ReturnType<typeof getUserOrderData_Service>>

export const verifyStripeCheckoutSession_inStripeConnectedAccount = async (
    order: orderType
) => {
    let stripeCheckoutSession: Stripe.Checkout.Session | null = null;
    let paymentIntent: Stripe.PaymentIntent | null = null;
    try {
        if (!order) {
            throw new KNOWN_ERROR("Order not found", "ORDER_NOT_FOUND");
        }
        if (!order.storeId) {
            throw new KNOWN_ERROR("Store not found", "STORE_NOT_FOUND");
        }
        if (order.paymentId !== 'stripe') {
            throw new KNOWN_ERROR("Order not paid with stripe", "ORDER_NOT_PAID_WITH_STRIPE");
        }
        const orderStripeData = await getOrderStripeData_Service(order.orderId);
        const checkoutSessionId = orderStripeData?.checkoutSessionId;
        if (!checkoutSessionId) {
            throw new KNOWN_ERROR("Checkout session ID not found", "CHECKOUT_SESSION_ID_NOT_FOUND");
        }
        if (!orderStripeData.storeStripeConnectAccountId) {
            throw new KNOWN_ERROR(
                "Store stripe connect account ID not found",
                "STORE_STRIPE_CONNECT_ACCOUNT_ID_NOT_FOUND"
            );
        }
        stripeCheckoutSession = await stripe.checkout.sessions.retrieve(
            checkoutSessionId,
            {},
            {
                stripeAccount: orderStripeData.storeStripeConnectAccountId
            }
        );
        const paymentIntentId = stripeCheckoutSession.payment_intent;
        // if (!paymentIntentId) {
        //     // means payment link cancelled, not completed
        //     throw new KNOWN_ERROR("Payment intent ID not found", "PAYMENT_INTENT_ID_NOT_FOUND");
        // }
        // if (typeof paymentIntentId !== 'string') {
        //     throw new KNOWN_ERROR("Payment intent ID not found", "PAYMENT_INTENT_ID_NOT_FOUND");
        // }
        if (stripeCheckoutSession.status !== 'complete') {
            throw new KNOWN_ERROR("Checkout session not completed", "CHECKOUT_SESSION_NOT_COMPLETED");
        }
        // if (stripeCheckoutSession.payment_status !== 'unpaid') { // I use manual capture
        //     throw new KNOWN_ERROR("Checkout session not paid", "CHECKOUT_SESSION_NOT_PAID");
        // }
        if (paymentIntentId && typeof paymentIntentId === 'string') {
            paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {}, {
                stripeAccount: orderStripeData.storeStripeConnectAccountId
            });
            await updateOrderStripeData_Service(order.orderId, {
                paymentIntentId: paymentIntentId,
            });
            // canceled
            // processing
            // requires_action
            // requires_confirmation
            // requires_payment_method

            // requires_capture
            // succeeded
            if (paymentIntent.status === 'canceled') {
                throw new KNOWN_ERROR("Payment intent canceled", "PAYMENT_INTENT_CANCELED");
            }
            if (paymentIntent.status === 'processing') {
                throw new KNOWN_ERROR("Payment intent processing", "PAYMENT_INTENT_PROCESSING");
            }
            if (paymentIntent.status === 'requires_action') {
                throw new KNOWN_ERROR("Payment intent requires action", "PAYMENT_INTENT_REQUIRES_ACTION");
            }
            if (paymentIntent.status === 'requires_confirmation') {
                throw new KNOWN_ERROR("Payment intent requires confirmation", "PAYMENT_INTENT_REQUIRES_CONFIRMATION");
            }
            if (paymentIntent.status === 'requires_payment_method') {
                throw new KNOWN_ERROR("Payment intent requires payment method", "PAYMENT_INTENT_REQUIRES_PAYMENT_METHOD");
            }
            // if (paymentIntent.status === 'requires_capture') { // as expected i use manual capture so status must be "requires_capture"
            //     throw new KNOWN_ERROR("Payment intent requires capture", "PAYMENT_INTENT_REQUIRES_CAPTURE");
            // }
            // if (paymentIntent.status === 'succeeded') {
            //     throw new KNOWN_ERROR("Payment intent succeeded", "PAYMENT_INTENT_SUCCEEDED");
            // }
        }
        return {
            stripeCheckoutSession,
            paymentIntent,
            error: null as ErrorType
        }
    } catch (error) {
        if (error instanceof KNOWN_ERROR) {
            return {
                stripeCheckoutSession,
                paymentIntent,
                error: error
            }
        } else {
            console.error("unknown error");
            console.error(error);
            throw new KNOWN_ERROR("Payment error", "PAYMENT_ERROR");
        }
    }
}