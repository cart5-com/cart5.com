export type PaymentMethodType = {
    isOnline: boolean;
    id: 'stripe' | 'cash' | 'cardTerminal' | string;
    name: string;
    description?: string;
    icon?: string;

    paymentReferenceId?: string; // for 'stripe' -> checkout.session.id
}