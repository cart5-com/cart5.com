import { KNOWN_ERROR } from "@lib/types/errors";
import { stripe } from "./stripe";
import { updateOrderStripeData_Service } from "@db/services/order.service";

export const capturePaymentIntent_inStripeConnectedAccount = async (
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
    return await stripe.paymentIntents.capture(paymentIntentId, {
        metadata: {
            orderId: orderId,
            checkoutSessionId: checkoutSessionId,
            paymentIntentId: paymentIntentId,
            storeStripeConnectAccountId: storeStripeConnectAccountId,
        },
    }, {
        stripeAccount: storeStripeConnectAccountId,
    });
}