import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { Context } from "hono";
import { redactEmail } from "@lib/utils/redactEmail";
import type { Stripe } from "stripe";
import type { ErrorType } from "@lib/types/errors";
import { getStoreAsAStripeCustomer_Service } from "@db/services/store.service";


// Helper function to redact billing details
const redactBillingDetails = (billingDetails: Stripe.PaymentMethod.BillingDetails | undefined) => {
    if (!billingDetails) return undefined;
    return {
        email: billingDetails.email ? redactEmail(billingDetails.email) : undefined,
        name: billingDetails.name ? `${billingDetails.name.charAt(0)}. ${billingDetails.name.split(' ').pop()?.charAt(0)}...` : undefined,
        phone: billingDetails.phone ? `xxx-xxx-${billingDetails.phone.slice(-4)}` : undefined,
        address: billingDetails.address ? {
            country: billingDetails.address.country,
            postal_code: billingDetails.address.postal_code ? `${billingDetails.address.postal_code.slice(0, 1)}...` : undefined,
            state: billingDetails.address.state,
            city: billingDetails.address.city ? `${billingDetails.address.city.charAt(0)}...` : undefined,
            line1: billingDetails.address.line1 ? '...' : undefined,
            line2: billingDetails.address.line2 ? '...' : undefined
        } : undefined
    };
};

export const getDetails_Handler = async (c: Context<
    HonoVariables
>) => {
    const storeId = c.req.param('storeId');
    const storeAsAStripeCustomer = await getStoreAsAStripeCustomer_Service(storeId, {
        // stripeCustomerId: true,
        paymentMethodDetails: true,
        hasChargablePaymentMethod: true,
        // lastVerifiedPaymentMethodId: true,
    });
    if (storeAsAStripeCustomer && storeAsAStripeCustomer.paymentMethodDetails) {
        // reomve all others but keep redacted
        const methodDetails = storeAsAStripeCustomer.paymentMethodDetails[storeAsAStripeCustomer.paymentMethodDetails.type];
        if (methodDetails) {
            (storeAsAStripeCustomer.paymentMethodDetails as any).redacted = {
                billingDetails: redactBillingDetails(storeAsAStripeCustomer.paymentMethodDetails.billing_details),
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
        data: storeAsAStripeCustomer,
        error: null as ErrorType
    }, 200);
}