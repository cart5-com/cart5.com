import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { Context } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
import { STRIPE_CHECKOUT_SESSION_ID_COOKIE_NAME } from "./consts";
import { KNOWN_ERROR } from "@lib/types/errors";
import { Stripe } from "stripe";
import { getEnvVariable } from "@lib/utils/getEnvVariable";
import type { ErrorType } from "@lib/types/errors";
import { getStoreTaxSettings_Service, updateStoreAsAStripeCustomer_Service } from "@db/services/store.service";

export const verifyCheckout_Handler = async (c: Context<
    HonoVariables
>) => {
    const storeId = c.req.param('storeId');
    const stripeCheckoutSessionId = getCookie(c, STRIPE_CHECKOUT_SESSION_ID_COOKIE_NAME);
    const storeTaxSettings = await getStoreTaxSettings_Service(storeId, {
        currency: true,
    });
    if (!storeTaxSettings?.currency) {
        throw new KNOWN_ERROR(
            "Store currency not found, please set the store currency first in the tax settings",
            "STORE_CURRENCY_NOT_FOUND"
        );
    }

    if (!stripeCheckoutSessionId) {
        throw new KNOWN_ERROR(
            "Stripe checkout session id not found",
            "STRIPE_CHECKOUT_SESSION_ID_NOT_FOUND"
        );
    }
    try {
        const stripe = new Stripe(getEnvVariable("STRIPE_SECRET_KEY"), {
            apiVersion: '2025-03-31.basil',
        });

        const session = await stripe.checkout.sessions.retrieve(
            stripeCheckoutSessionId
        );

        if (session.status !== 'complete') {
            throw new KNOWN_ERROR(
                "Stripe checkout session is not complete",
                "STRIPE_CHECKOUT_SESSION_NOT_COMPLETE"
            );
        }

        if (!session.setup_intent) {
            throw new KNOWN_ERROR(
                "Stripe checkout session does not have a setup intent",
                "STRIPE_CHECKOUT_SESSION_NO_SETUP_INTENT"
            );
        }

        const setupIntent = await stripe.setupIntents.retrieve(
            typeof session.setup_intent === 'string'
                ? session.setup_intent
                : session.setup_intent.id
        );

        if (setupIntent.status === 'succeeded' && setupIntent.payment_method) {
            const paymentMethod = await stripe.paymentMethods.retrieve(
                setupIntent.payment_method as string
            );

            const paymentIntent = await stripe.paymentIntents.create({
                amount: 10, // 0.10 GBP/USD/CAD etc..
                currency: storeTaxSettings.currency,
                customer: session.customer as string,
                payment_method: setupIntent.payment_method as string,
                off_session: true,
                confirm: true,
                capture_method: 'manual',
            });


            if (paymentIntent.status !== 'requires_capture') {
                throw new KNOWN_ERROR(
                    "Stripe payment intent is not succeeded",
                    "STRIPE_PAYMENT_INTENT_NOT_SUCCEEDED"
                );
            }
            // cancel the payment intent if succeeded
            const cancelledPaymentIntent = await stripe.paymentIntents.cancel(paymentIntent.id);
            if (cancelledPaymentIntent.status !== 'canceled') {
                // wait 2 seconds and try again
                await new Promise(resolve => setTimeout(resolve, 3000));
                const cancelledPaymentIntent2 = await stripe.paymentIntents.cancel(paymentIntent.id);
                if (cancelledPaymentIntent2.status !== 'canceled') {
                    throw new KNOWN_ERROR(
                        "Stripe payment intent is not canceled, no need to worry about it. capture must be completed within 7 days. Otherwise, as with any other uncaptured payment, the authorisation automatically expires and you can no longer capture the payment. https://docs.stripe.com/radar/reviews/auth-and-capture",
                        "STRIPE_PAYMENT_INTENT_NOT_CANCELED"
                    );
                }
            }

            await updateStoreAsAStripeCustomer_Service(storeId, {
                hasChargablePaymentMethod: true,
                lastVerifiedPaymentMethodId: setupIntent.payment_method as string,
                paymentMethodDetails: paymentMethod,
            });

            deleteCookie(c, STRIPE_CHECKOUT_SESSION_ID_COOKIE_NAME);
            return c.json({
                data: {
                    success: true,
                    message: "Payment method verified and saved successfully"
                },
                error: null as ErrorType
            }, 200);
        } else {
            throw new KNOWN_ERROR(
                `Setup intent status is ${setupIntent.status}, not 'succeeded'`,
                "STRIPE_SETUP_INTENT_NOT_SUCCEEDED"
            );
        }
    } catch (error) {
        console.error('Stripe payment method verification error:', error);

        if (error instanceof KNOWN_ERROR) {
            throw error;
        }

        throw new KNOWN_ERROR(
            "Failed to verify Stripe payment method",
            "STRIPE_ERROR"
        );
    }
}