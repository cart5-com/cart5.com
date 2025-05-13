import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { KNOWN_ERROR, type ErrorType } from "@lib/types/errors";
import { getStoreAsAStripeCustomer_Service, getStoreTaxSettings_Service, updateStoreAsAStripeCustomer_Service } from "@db/services/store.service";
import { ENFORCE_HOSTNAME_CHECKS } from "@lib/utils/enforceHostnameChecks";
import { setCookie } from "hono/cookie";
import { STRIPE_CHECKOUT_SESSION_ID_COOKIE_NAME } from "./consts";
import { stripe } from "@api-hono/utils/stripe/stripe";


export const startNewCheckout_Handler = async (c: Context<
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
        // const existingCustomers = await stripe.customers.search({
        //     query: `metadata["storeId"]:"${storeId}"`,
        //     limit: 1,
        // });
        const storeAsAStripeCustomer = await getStoreAsAStripeCustomer_Service(storeId, {
            stripeCustomerId: true,
        });
        let customerId = storeAsAStripeCustomer?.stripeCustomerId ?? null;
        if (!customerId) {
            const customer = await stripe.customers.create({
                metadata: {
                    storeId: storeId,
                },
            });
            await updateStoreAsAStripeCustomer_Service(storeId, {
                stripeCustomerId: customer.id,
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
            success_url: `https://${host}/dashboard/store/${storeId}/payment-methods#stripe-success`,
            cancel_url: `https://${host}/dashboard/store/${storeId}/payment-methods#stripe-cancel`,
            ui_mode: 'hosted',
            currency: storeTaxSettings?.currency,
            // invoice_creation: { enabled: false },
            // locale: 'auto',
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