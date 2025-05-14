import { KNOWN_ERROR } from "@lib/types/errors";
import { stripe } from "./stripe";
import { updateOrderStripeData_Service } from "@db/services/order.service";
import { Stripe } from "stripe";
import { refundCreate_inStripeConnectedAccount } from "./refundCreate_inStripeConnectedAccount";

export const cancelPaymentIntent_inStripeConnectedAccount = async (
    orderId: string,
    checkoutSessionId: string | null,
    paymentIntentId: string | null,
    storeStripeConnectAccountId: string | null,
) => {
    if (!storeStripeConnectAccountId) {
        throw new KNOWN_ERROR("Store Stripe Connect Account ID is required", "STORE_STRIPE_CONNECT_ACCOUNT_ID_REQUIRED");
    }
    if (!paymentIntentId) {
        // fallback to checkout session id to find payment intent id if required
        if (!checkoutSessionId) {
            throw new KNOWN_ERROR("Checkout Session ID is required", "CHECKOUT_SESSION_ID_REQUIRED");
        }
        const checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId, {
            stripeAccount: storeStripeConnectAccountId,
        });
        if (!checkoutSession.payment_intent || typeof checkoutSession.payment_intent !== "string") {
            throw new KNOWN_ERROR("Payment Intent ID is required", "PAYMENT_INTENT_ID_REQUIRED");
        }
        paymentIntentId = checkoutSession.payment_intent;
        await updateOrderStripeData_Service(orderId, {
            paymentIntentId: paymentIntentId,
        });
    }
    try {
        return await stripe.paymentIntents.cancel(paymentIntentId, {
            cancellation_reason: 'abandoned', // but maybe abandoned by store not customer?
        }, {
            stripeAccount: storeStripeConnectAccountId,
        });
    } catch (error) {
        // handle payment_intent_unexpected_state with refundCreate_inStripeConnectedAccount
        if (error && typeof error === 'object' && 'code' in error && error.code === 'payment_intent_unexpected_state') {
            console.log("Payment Intent unexpected state, creating refund");
            console.log(error);
            console.log(error.code);
            return await refundCreate_inStripeConnectedAccount(orderId, checkoutSessionId, paymentIntentId, storeStripeConnectAccountId);
        } else {
            console.error(error);
            throw error;
        }
    }
}