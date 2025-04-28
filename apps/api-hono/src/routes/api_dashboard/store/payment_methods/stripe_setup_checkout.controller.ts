import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { KNOWN_ERROR, type ErrorType } from "@lib/types/errors";
import { getStoreTaxSettings_Service } from "@db/services/store.service";
import Stripe from "stripe";
import { getEnvVariable } from "@lib/utils/getEnvVariable";
import { ENFORCE_HOSTNAME_CHECKS } from "@lib/utils/enforceHostnameChecks";
import { setCookie } from "hono/cookie";
const STRIPE_CHECKOUT_SESSION_ID_COOKIE_NAME = "STRIPE_CHECKOUT_SESSION_ID";

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

export const stripeSetupCheckout_Handler = async (c: Context<
    HonoVariables
>) => {
    const storeId = c.req.param('storeId');
    const storeTaxSettings = await getStoreTaxSettings_Service(storeId, {
        currency: true,
    });
    if (!storeTaxSettings?.currency) {
        throw new KNOWN_ERROR(
            "Store currency not found, please set the store currency first in the tax settings",
            "STORE_CURRENCY_NOT_FOUND"
        );
    }
    try {
        // Initialize Stripe with API key
        const stripe = new Stripe(getEnvVariable("STRIPE_SECRET_KEY"), {
            apiVersion: '2025-03-31.basil',
        });
        const existingCustomers = await stripe.customers.search({
            query: `metadata["storeId"]:"${storeId}"`,
            limit: 1,
        });
        let customerId = null;
        if (existingCustomers.data.length > 0) {
            customerId = existingCustomers.data[0].id;
        } else {
            const customer = await stripe.customers.create({
                metadata: {
                    storeId: storeId,
                },
            });
            customerId = customer.id;
        }
        const host = c.req.header()['host'];
        // /dashboard/store/str_4_4_4/payment-methods
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            // customer_creation: 'always',
            customer_update: {
                name: 'auto',
                address: 'auto',
                shipping: 'auto',
            },
            metadata: {
                storeId: storeId,
                stripeCustomerId: customerId,
            },
            mode: 'setup',
            success_url: `https://${host}/dashboard/store/${storeId}/payment-methods?reason=success_url`,
            cancel_url: `https://${host}/dashboard/store/${storeId}/payment-methods?reason=cancel_url`,
            ui_mode: 'hosted',
            currency: storeTaxSettings?.currency,
            // invoice_creation: { enabled: false },
            locale: 'auto',
            setup_intent_data: {
                description: `Setup payment method for storeId:${storeId} on cart5.com`,
                metadata: {
                    storeId,
                },
            },
            billing_address_collection: 'required',
            automatic_tax: {
                enabled: false,
            },
            tax_id_collection: {
                enabled: false,
            },
        });

        setCookie(c, STRIPE_CHECKOUT_SESSION_ID_COOKIE_NAME, session.id, {
            path: "/",
            secure: ENFORCE_HOSTNAME_CHECKS,
            httpOnly: true,
            maxAge: 86400, // 24 hours // stripe checkout session 'expires_at' 24 hours from creation.
            sameSite: "strict"
        });
        return c.json({
            data: session.url,
            error: null as ErrorType
        }, 200);
    } catch (error) {
        console.error('Stripe checkout setup error:', error);
        throw new KNOWN_ERROR(
            "Failed to setup Stripe checkout",
            "STRIPE_ERROR"
        );
    }
} 