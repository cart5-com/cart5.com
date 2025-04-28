import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import { STRIPE_CHECKOUT_SESSION_ID_COOKIE_NAME } from "./consts";
import { KNOWN_ERROR } from "@lib/types/errors";
import { Stripe } from "stripe";
import { getEnvVariable } from "@lib/utils/getEnvVariable";
import type { ErrorType } from "@lib/types/errors";
import { updateStoreAsAStripeCustomer_Service } from "@db/services/store.service";

export const verifyCheckout_Handler = async (c: Context<
    HonoVariables
>) => {
    const storeId = c.req.param('storeId');
    const stripeCheckoutSessionId = getCookie(c, STRIPE_CHECKOUT_SESSION_ID_COOKIE_NAME);
    // TODO: remove cookie after testing

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

        // Step 1: Retrieve the checkout session
        const session = await stripe.checkout.sessions.retrieve(
            stripeCheckoutSessionId
        );

        // Step 2: Verify session status
        if (session.status !== 'complete') {
            throw new KNOWN_ERROR(
                "Stripe checkout session is not complete",
                "STRIPE_CHECKOUT_SESSION_NOT_COMPLETE"
            );
        }

        // Step 3: Get the setup intent from the session
        if (!session.setup_intent) {
            throw new KNOWN_ERROR(
                "Stripe checkout session does not have a setup intent",
                "STRIPE_CHECKOUT_SESSION_NO_SETUP_INTENT"
            );
        }

        // Step 4: Retrieve the setup intent to check its status
        const setupIntent = await stripe.setupIntents.retrieve(
            typeof session.setup_intent === 'string'
                ? session.setup_intent
                : session.setup_intent.id
        );

        // Step 5: Check if setup intent succeeded
        if (setupIntent.status === 'succeeded') {
            // Step 6: Update store record indicating chargable payment method exists
            await updateStoreAsAStripeCustomer_Service(storeId, {
                hasChargablePaymentMethod: true,
                lastVerifiedPaymentMethodId: setupIntent.payment_method as string,
            });

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


// export const retrieveStripeCheckoutSessionId_Handler = async (c: Context<
//     HonoVariables
// >) => {
//     const storeId = c.req.param('storeId');
//     const stripeCheckoutSessionId = getCookie(c, STRIPE_CHECKOUT_SESSION_ID_COOKIE_NAME);
//     if (!stripeCheckoutSessionId) {
//         throw new KNOWN_ERROR(
//             "Stripe checkout session id not found",
//             "STRIPE_CHECKOUT_SESSION_ID_NOT_FOUND"
//         );
//     }
//     const stripe = new Stripe(getEnvVariable("STRIPE_SECRET_KEY"), {
//         apiVersion: '2025-03-31.basil',
//     });
//     const session = await stripe.checkout.sessions.retrieve(
//         stripeCheckoutSessionId
//     );
//     if (typeof session.customer === "string") {
//         await updateStoreStripeCustomerId_Service(storeId, session.customer, {
//             isChargable: true,
//         });
//     } else {
//         console.error("Stripe checkout session customer not found", session);
//         throw new KNOWN_ERROR(
//             "Stripe checkout session customer not found",
//             "STRIPE_CHECKOUT_SESSION_CUSTOMER_NOT_FOUND"
//         );
//     }
//     return c.json({
//         data: session,
//         error: null as ErrorType
//     }, 200);
// }

// const sampleRetrieveCheckoutSession = {
//     "data": {
//         "id": "cs_test_c1tyJcuNX0AAs2qOeoP3mkEc2ZIWD8XChUOkCozIbsY7uSWbCA5QFicugy",
//         "object": "checkout.session",
//         "adaptive_pricing": null,
//         "after_expiration": null,
//         "allow_promotion_codes": null,
//         "amount_subtotal": 0,
//         "amount_total": 0,
//         "automatic_tax": {
//             "enabled": false,
//             "liability": null,
//             "provider": null,
//             "status": null
//         },
//         "billing_address_collection": "required",
//         "cancel_url": "https://www.obite.co.uk/dashboard/store/str_4_4_4/payment-methods?reason=cancel_url",
//         "client_reference_id": "str_4_4_4",
//         "client_secret": null,
//         "collected_information": {
//             "shipping_details": null
//         },
//         "consent": null,
//         "consent_collection": null,
//         "created": 1745817098,
//         "currency": "cad",
//         "currency_conversion": null,
//         "custom_fields": [],
//         "custom_text": {
//             "after_submit": null,
//             "shipping_address": null,
//             "submit": null,
//             "terms_of_service_acceptance": null
//         },
//         "customer": "cus_SDAJ4fEE3nQ9DH",
//         "customer_creation": "always",
//         "customer_details": {
//             "address": null,
//             "email": "keremtiryaki@gmail.com",
//             "name": "kerem tiryaki",
//             "phone": null,
//             "tax_exempt": null,
//             "tax_ids": []
//         },
//         "customer_email": null,
//         "discounts": null,
//         "expires_at": 1745903497,
//         "invoice": null,
//         "invoice_creation": null,
//         "livemode": false,
//         "locale": "auto",
//         "metadata": {
//             "storeId": "str_4_4_4"
//         },
//         "mode": "setup",
//         "payment_intent": null,
//         "payment_link": null,
//         "payment_method_collection": "always",
//         "payment_method_configuration_details": {
//             "id": "pmc_1RIjjA4S2F5blW6GEYef756o",
//             "parent": null
//         },
//         "payment_method_options": {
//             "card": {
//                 "request_three_d_secure": "automatic"
//             }
//         },
//         "payment_method_types": [
//             "card",
//             "link"
//         ],
//         "payment_status": "no_payment_required",
//         "permissions": null,
//         "phone_number_collection": {
//             "enabled": false
//         },
//         "recovered_from": null,
//         "saved_payment_method_options": null,
//         "setup_intent": "seti_1RIjyg4S2F5blW6G1MfqPOZv",
//         "shipping_address_collection": null,
//         "shipping_cost": null,
//         "shipping_options": [],
//         "status": "complete",
//         "submit_type": null,
//         "subscription": null,
//         "success_url": "https://www.obite.co.uk/dashboard/store/str_4_4_4/payment-methods?reason=success_url",
//         "total_details": null,
//         "ui_mode": "hosted",
//         "url": null,
//         "wallet_options": null
//     },
//     "error": null
// }