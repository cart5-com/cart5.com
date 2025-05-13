import { formatAmountForStripe } from "@lib/utils/formatAmountForStripe";
import { getStripeCustomerId_inStripePlatformAccount } from "./getStripeCustomerId_inStripePlatformAccount";
import { stripe } from "./stripe";

export const createCheckoutSession_inStripeConnectedAccount = async (
    success_url: string,
    cancel_url: string,
    orderId: string,
    userEmail: string,
    userVerifiedPhoneNumbers: string,
    userId: string,
    applicationFee: number,
    storeId: string,
    storeStripeConnectAccountId: string,
    currency: string,
    unit_amount: number,
    product_data_name: string,
    quantity: number = 1,
    statement_descriptor: string,
    statement_descriptor_suffix: string
    // line_items: Stripe.Checkout.SessionCreateParams.LineItem[],
) => {
    // Ensure statement descriptor is at most 22 characters
    if (statement_descriptor.length > 22) {
        statement_descriptor = statement_descriptor.substring(0, 22);
    }
    if (statement_descriptor_suffix.length > 22) {
        statement_descriptor_suffix = statement_descriptor_suffix.substring(0, 22);
    }
    const stripeCustomerId_inStripePlatformAccount = await getStripeCustomerId_inStripePlatformAccount(userId, userEmail, userVerifiedPhoneNumbers);
    //The Epoch time in seconds at which the Checkout Session will expire. It can be anywhere from 30 minutes to 24 hours after Checkout Session creation. By default, this value is 24 hours from creation.
    const expires_at = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now in seconds
    const session = await stripe.checkout.sessions.create({
        success_url,
        cancel_url,
        expires_at,
        allow_promotion_codes: false,
        adaptive_pricing: { enabled: false },
        automatic_tax: {
            enabled: false,
        },
        client_reference_id: orderId,
        line_items: [
            {
                price_data: {
                    unit_amount: formatAmountForStripe(unit_amount, currency),
                    currency,
                    product_data: {
                        name: product_data_name,
                    },
                },
                quantity,
            }
        ],
        mode: 'payment', // 'setup'?
        // locale: 'auto',
        // customer: stripeCustomerId,
        customer_email: userEmail, // both not allowed
        // invoice_creation: {
        //     enabled: false,
        // },
        // customer_update: {
        //     address: 'never',
        //     shipping: 'never',
        //     name: 'never',
        // },
        consent_collection: {
            terms_of_service: 'required' // "none",
        },
        custom_text: {
            terms_of_service_acceptance: {
                // message2: 'All orders are final and non-refundable to prevent dispute abuses. If you need ask refund, please contact the store directly by phone or in person.',
                message: 'All sales are final and non-refundable. You agree to contact the merchant by phone call or in person for any issues rather than filing payment disputes.'
            },
            after_submit: {
                message: 'Please wait for the next page to fully load to complete your order.',
            },
        },
        payment_intent_data: {
            capture_method: 'manual',
            application_fee_amount: formatAmountForStripe(applicationFee, currency),
            statement_descriptor,
            statement_descriptor_suffix,
            receipt_email: userEmail,
            // description: ``,
            metadata: {
                userVerifiedPhoneNumbers,
                orderId,
                storeId,
                userId,
                userEmail,
                stripeCustomerId_inStripePlatformAccount,
                storeStripeConnectAccountId,
            },
        },
        phone_number_collection: {
            enabled: false,
        },
        metadata: {
            userVerifiedPhoneNumbers,
            orderId,
            storeId,
            userId,
            userEmail,
            stripeCustomerId_inStripePlatformAccount,
            storeStripeConnectAccountId,
        },
        tax_id_collection: {
            enabled: false,
        },
    }, {
        stripeAccount: storeStripeConnectAccountId,
    });
    return session;
}