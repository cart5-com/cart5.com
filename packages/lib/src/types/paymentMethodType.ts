export type PaymentMethodType = {
    isOnline: boolean;
    id: 'stripe' | 'cash' | 'cardTerminal' | string;
    name: string;
    description?: string;
    icon?: string;

    stripe?: {
        checkoutSessionId?: string; // for 'stripe' -> checkout.session.id
        isPaymentAuthorizationVerified?: boolean; // for 'stripe' -> checkout.session.payment_intent
    }
}