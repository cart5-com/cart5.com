import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { KNOWN_ERROR, type ErrorType } from "@lib/types/errors";
import { getStoreStripeSettingsData_Service } from "@db/services/store.service";
import Stripe from "stripe";
import { getEnvVariable } from "@lib/utils/getEnvVariable";
import { IS_PROD } from "@lib/utils/getEnvVariable";
export const stripeGetAccount_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/stripe/get_account"
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
            throw new KNOWN_ERROR(
                "Stripe account not found",
                "STRIPE_ERROR"
            );
        }
        const account = await stripe.accounts.retrieve(stripeConnectAccountId);
        if (IS_PROD) {
            return c.json({
                data: {
                    email: account.email,
                    id: account.id,
                    details_submitted: account.details_submitted,
                    charges_enabled: account.charges_enabled,
                },
                error: null as ErrorType
            }, 200);
        } else {
            return c.json({
                data: account,
                error: null as ErrorType
            }, 200);
        }
    } catch (error) {
        console.error('Stripe account retrieval error:', error);
        throw new KNOWN_ERROR(
            "Failed to get Stripe account",
            "STRIPE_ERROR"
        );
    }
} 