import { KNOWN_ERROR } from "@lib/types/errors";
import { stripe } from "./stripe";
import { updateOrderStripeData_Service } from "@db/services/order.service";


/*/
already refunded orders does not throw error
/*/
export const refundCreate_inStripeConnectedAccount = async (
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
    /*/
{
  id: 'pyr_1ROmzUGhYYm9KAMBeAPgbFks',
  object: 'refund',
  amount: 1065,
  balance_transaction: 'txn_1ROmzUGhYYm9KAMBRvbNqtFh',
  charge: 'py_3ROXOgGhYYm9KAMB0jJwH2jH',
  created: 1747258648,
  currency: 'cad',
  metadata: {},
  payment_intent: 'pi_3ROXOgGhYYm9KAMB0ilF2Bn6',
  reason: null,
  receipt_number: null,
  source_transfer_reversal: null,
  status: 'succeeded',
  transfer_reversal: null
}
    /*/
    try {
        return await stripe.refunds.create({
            payment_intent: paymentIntentId,
            // check connect account owners can see this option while refunding in stripe dashboard!
            // I was able to see it in my stripe dashboard, but I have the access to all connect accounts!

            // Yes, connect account owner can not see this option while refunding in stripe dashboard!
            // so no need to worry about it!
            refund_application_fee: false,
        }, {
            stripeAccount: storeStripeConnectAccountId,
        });
    } catch (error) {
        if (
            error &&
            typeof error === "object" &&
            'code' in error &&
            error.code === "payment_method_provider_decline" &&
            'message' in error &&
            typeof error.message === "string" &&
            error.message.toLowerCase().includes("cannot refund a payment for amount=0".toLowerCase())
        ) {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
                stripeAccount: storeStripeConnectAccountId,
            });
            const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string, {
                stripeAccount: storeStripeConnectAccountId,
            });
            if (charge.refunded) {
                console.log("Refund already created, ignoring", {
                    orderId,
                    checkoutSessionId,
                    paymentIntentId,
                    storeStripeConnectAccountId,
                });
                return null;
            } else {
                throw error;
            }
        } else {
            throw error;
        }
    }
}