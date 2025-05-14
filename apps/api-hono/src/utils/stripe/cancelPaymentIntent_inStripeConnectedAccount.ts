import { KNOWN_ERROR } from "@lib/types/errors";
import { stripe } from "./stripe";
import { updateOrderStripeData_Service } from "@db/services/order.service";
import { refundCreate_inStripeConnectedAccount } from "./refundCreate_inStripeConnectedAccount";

/*/
already canceled orders does not throw error
already succeeded orders does not throw error, but creates refund
/*/
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
        if (
            error &&
            typeof error === 'object' &&
            'payment_intent' in error &&
            error.payment_intent &&
            typeof error.payment_intent === 'object' &&
            'status' in error.payment_intent &&
            error.payment_intent.status === 'canceled'
        ) {
            console.log("Payment Intent already canceled, ignoring", {
                orderId,
                checkoutSessionId,
                paymentIntentId,
                storeStripeConnectAccountId,
            });
            return null;
        } else if (
            error &&
            typeof error === 'object' &&
            'payment_intent' in error &&
            error.payment_intent &&
            typeof error.payment_intent === 'object' &&
            'status' in error.payment_intent &&
            error.payment_intent.status === 'succeeded'
        ) {
            // already succeeded, create refund
            return await refundCreate_inStripeConnectedAccount(orderId, checkoutSessionId, paymentIntentId, storeStripeConnectAccountId);
        } else {
            throw error;
        }
    }
}