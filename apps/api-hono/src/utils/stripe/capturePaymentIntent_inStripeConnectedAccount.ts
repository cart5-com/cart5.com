import { KNOWN_ERROR } from "@lib/types/errors";
import { stripe } from "./stripe";
import { updateOrderStripeData_Service } from "@db/services/order.service";


/*/
already captured orders does not throw error
/*/
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
    try {
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
    } catch (error) {
        if (error &&
            typeof error === 'object' &&
            'payment_intent' in error &&
            error.payment_intent &&
            typeof error.payment_intent === 'object' &&
            'status' in error.payment_intent &&
            error.payment_intent.status === 'succeeded' &&
            'latest_charge' in error.payment_intent
        ) {
            const charge = await stripe.charges.retrieve(error.payment_intent.latest_charge as string, {
                stripeAccount: storeStripeConnectAccountId,
            });
            if (!charge.refunded) {
                // already captured
                console.log("Payment Intent already captured, ignoring", {
                    orderId,
                    checkoutSessionId,
                    paymentIntentId,
                    storeStripeConnectAccountId,
                });
                return null;
            } else {
                console.log("unexpected capturePaymentIntent becuase it was already refunded❌!", {
                    orderId,
                    checkoutSessionId,
                    paymentIntentId,
                    storeStripeConnectAccountId,
                });
                throw error;
            }
        } else {
            throw error;
        }
    }
}