import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { KNOWN_ERROR, type ErrorType } from "@lib/types/errors";
import { getStoreStripeSettingsData_Service, updateStoreStripeSettingsData_Service } from "@db/services/store.service";
import Stripe from "stripe";
import { getEnvVariable } from "@lib/utils/getEnvVariable";

export const stripeAccount_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/stripe/account"
>) => {
    const { storeId } = c.req.param();

    try {
        // Initialize Stripe with API key
        const stripe = new Stripe(getEnvVariable("STRIPE_SECRET_KEY"), {
            apiVersion: '2025-03-31.basil',
        });

        // Check if store already has a Stripe account
        const existingStripeData = await getStoreStripeSettingsData_Service(storeId);
        let stripeConnectAccountId = existingStripeData?.stripeConnectAccountId;
        if (!stripeConnectAccountId) {
            // Create a Stripe Connect account
            const account = await stripe.accounts.create({
                controller: {
                    fees: {
                        payer: 'account',
                    },
                    losses: {
                        payments: 'stripe',
                    },
                    stripe_dashboard: {
                        type: 'full',
                    },
                    requirement_collection: 'stripe',
                },
                // settings: {
                //     invoices: {
                //         hosted_payment_method_save: "never"
                //     }  
                // },
                metadata: {
                    storeId,
                },
            });
            // Store the account ID in our database
            await updateStoreStripeSettingsData_Service(storeId, {
                stripeConnectAccountId: account.id,
            });
            stripeConnectAccountId = account.id;
        }
        const host = c.req.header()['host'];
        // `/dashboard/store/{storeId}/stripe`
        const accountLink = await stripe.accountLinks.create({
            account: stripeConnectAccountId,
            refresh_url: `https://${host}/dashboard/store/${storeId}/stripe?refresh=true`,
            return_url: `https://${host}/dashboard/store/${storeId}/stripe?setup=success`,
            type: 'account_onboarding',
        });

        return c.json({
            data: accountLink.url,
            error: null as ErrorType
        }, 200);
    } catch (error) {
        console.error('Stripe account creation error:', error);
        throw new KNOWN_ERROR(
            "Failed to create Stripe account",
            "STRIPE_ERROR"
        );
    }
} 