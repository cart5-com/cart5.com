// const paymentIntent = await stripe.paymentIntents.create({
//     amount: 1099,
//     currency: 'usd',
//     customer: '{{CUSTOMER_ID}}',
//     payment_method: '{{PAYMENT_METHOD_ID}}',
//     off_session: true,
//     confirm: true,
// });

import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { Context } from "hono";
import { redactEmail } from "@lib/utils/redactEmail";
import { deleteCookie, getCookie } from "hono/cookie";
import { STRIPE_CHECKOUT_SESSION_ID_COOKIE_NAME } from "./consts";
import { KNOWN_ERROR } from "@lib/types/errors";
import { Stripe } from "stripe";
import { getEnvVariable } from "@lib/utils/getEnvVariable";
import type { ErrorType } from "@lib/types/errors";
import { getStoreAsAStripeCustomer_Service, updateStoreAsAStripeCustomer_Service } from "@db/services/store.service";

// stripe types
interface BillingDetails {
    /**
     * Billing address.
     */
    address: Stripe.Address | null;

    /**
     * Email address.
     */
    email: string | null;

    /**
     * Full name.
     */
    name: string | null;

    /**
     * Billing phone number (including extension).
     */
    phone: string | null;
}
interface Address {
    /**
     * City/District/Suburb/Town/Village.
     */
    city: string | null;

    /**
     * 2-letter country code.
     */
    country: string | null;

    /**
     * Address line 1 (Street address/PO Box/Company name).
     */
    line1: string | null;

    /**
     * Address line 2 (Apartment/Suite/Unit/Building).
     */
    line2: string | null;

    /**
     * ZIP or postal code.
     */
    postal_code: string | null;

    /**
     * State/County/Province/Region.
     */
    state: string | null;
}

export const getDetails_Handler = async (c: Context<
    HonoVariables
>) => {
    const storeId = c.req.param('storeId');
    const storeAsAStripeCustomer = await getStoreAsAStripeCustomer_Service(storeId, {
        // stripeCustomerId: true,
        paymentMethodDetails: true,
        hasChargablePaymentMethod: true,
        lastVerifiedPaymentMethodId: true,
    });
    if (storeAsAStripeCustomer && storeAsAStripeCustomer.paymentMethodDetails) {
        // reomve all others but keep redacted
        const methodDetails = storeAsAStripeCustomer.paymentMethodDetails[storeAsAStripeCustomer.paymentMethodDetails.type];
        if (methodDetails) {
            (storeAsAStripeCustomer.paymentMethodDetails as any).redacted = {
                billingDetails: storeAsAStripeCustomer.paymentMethodDetails.billing_details,
                last4: (methodDetails as any)?.last4 ?? undefined,
                type: storeAsAStripeCustomer.paymentMethodDetails.type,
                brand: (methodDetails as any)?.brand ?? undefined,
                exp_month: storeAsAStripeCustomer.paymentMethodDetails.card?.exp_month ?? undefined,
                exp_year: storeAsAStripeCustomer.paymentMethodDetails.card?.exp_year ?? undefined,
                issuer: storeAsAStripeCustomer.paymentMethodDetails.card?.issuer ?? undefined,
                wallet: storeAsAStripeCustomer.paymentMethodDetails.card?.wallet?.type ?? undefined,
            }
        }
        storeAsAStripeCustomer.paymentMethodDetails = storeAsAStripeCustomer.paymentMethodDetails.redacted;
    }
    return c.json({
        data: {
            storeAsAStripeCustomer,
        },
        error: null as ErrorType
    }, 200);
}