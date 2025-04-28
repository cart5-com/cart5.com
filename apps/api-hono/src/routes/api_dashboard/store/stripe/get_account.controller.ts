import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { KNOWN_ERROR, type ErrorType } from "@lib/types/errors";
import { getStoreStripeConnectSettings_Service, updateStoreStripeConnectSettings_Service } from "@db/services/store.service";
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
        const existingStripeSettingsData = await getStoreStripeConnectSettings_Service(storeId);
        let stripeConnectAccountId = existingStripeSettingsData?.stripeConnectAccountId;
        if (!stripeConnectAccountId) {
            throw new KNOWN_ERROR(
                "Stripe account not found",
                "STRIPE_ERROR"
            );
        }
        const account = await stripe.accounts.retrieve(stripeConnectAccountId);
        const isReady = account.charges_enabled;
        if (!isReady && existingStripeSettingsData?.isStripeEnabled) {
            await updateStoreStripeConnectSettings_Service(storeId, {
                isStripeEnabled: false,
            });
            existingStripeSettingsData.isStripeEnabled = false;
            // TODO: send email notification to store owner
        }
        if (IS_PROD) {
            return c.json({
                data: {
                    existingStripeSettingsData,
                    account: {
                        email: account.email,
                        id: account.id,
                        details_submitted: account.details_submitted,
                        charges_enabled: account.charges_enabled,
                    },
                },
                error: null as ErrorType
            }, 200);
        } else {
            return c.json({
                data: {
                    existingStripeSettingsData,
                    account,
                },
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