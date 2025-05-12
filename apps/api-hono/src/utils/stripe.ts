import Stripe from "stripe";
import { getEnvVariable } from "@lib/utils/getEnvVariable";
import { getUserAsAStripeCustomer_Service, updateUserAsAStripeCustomer_Service } from "@db/services/user_data.service";

export const stripe = new Stripe(getEnvVariable("STRIPE_SECRET_KEY"), {
    apiVersion: '2025-03-31.basil',
});

export const getStripeCustomerId = async (
    userId: string,
    email: string,
    userVerifiedPhoneNumbers: string
) => {
    const userAsAStripeCustomer = await getUserAsAStripeCustomer_Service(userId, {
        stripeCustomerId: true,
    });
    let customerId = userAsAStripeCustomer?.stripeCustomerId ?? null;
    if (!customerId) {
        const customer = await stripe.customers.create({
            email: email,
            phone: userVerifiedPhoneNumbers,
            metadata: {
                userVerifiedPhoneNumbers,
                userId: userId,
                email: email,
            },
        });
        await updateUserAsAStripeCustomer_Service(userId, customer.id, {
            stripeCustomerId: customer.id
        });
        customerId = customer.id;
    }
    return customerId;
}

export const createPaymentSession = async (
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
    const stripeCustomerId = await getStripeCustomerId(userId, userEmail, userVerifiedPhoneNumbers);
    const session = await stripe.checkout.sessions.create({
        success_url,
        cancel_url,
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
                message: 'All sales are final and non-refundable. You agree to contact the merchant by calling/in person for any issues rather than filing payment disputes.'
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
                stripeCustomerId,
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
            stripeCustomerId,
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



// List of zero-decimal currencies according to Stripe docs
const ZERO_DECIMAL_CURRENCIES = [
    'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw',
    'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv',
    'xaf', 'xof', 'xpf'
];

// List of special case currencies that should be treated as zero-decimal
const SPECIAL_ZERO_DECIMAL_CURRENCIES = [
    'isk', // Icelandic Króna - technically has 2 decimals but used as zero-decimal
    // Note: HUF and TWD are special cases for payouts but use 2 decimals for charges
];

// Format the amount for Stripe based on currency
function formatAmountForStripe(amount: number, currency: string): number {
    const lowerCaseCurrency = currency.toLowerCase();

    if (ZERO_DECIMAL_CURRENCIES.includes(lowerCaseCurrency) ||
        SPECIAL_ZERO_DECIMAL_CURRENCIES.includes(lowerCaseCurrency)) {
        return Math.round(amount);
    }
    return Math.round(amount * 100);
}