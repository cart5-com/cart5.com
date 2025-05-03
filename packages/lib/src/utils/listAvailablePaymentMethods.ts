import type { PaymentMethodType } from "@lib/types/paymentMethodType";
import type { CustomPaymentMethod, PhysicalPaymentMethods } from "@lib/zod/paymentMethodsSchema";
type storeDataType = Awaited<ReturnType<typeof import("@db/services/store.service").getStoreData_Service>>;

export const listAvailablePaymentMethods = (
    storeData: storeDataType,
    currentOrderType: string,
) => {
    let paymentMethods: PhysicalPaymentMethods | null = null;
    const hasChargablePaymentMethod = storeData?.asStripeCustomer?.hasChargablePaymentMethod || false;
    const isStripeEnabled = storeData?.stripeSettings?.isStripeEnabled || false;
    if (storeData?.paymentMethods) {
        if (currentOrderType === 'delivery') {
            paymentMethods = storeData.paymentMethods.deliveryPaymentMethods?.isActive ?
                storeData.paymentMethods.deliveryPaymentMethods || null :
                storeData.paymentMethods.defaultPaymentMethods || null;
        } else if (currentOrderType === 'pickup') {
            paymentMethods = storeData.paymentMethods.pickupPaymentMethods?.isActive ?
                storeData.paymentMethods.pickupPaymentMethods || null :
                storeData.paymentMethods.defaultPaymentMethods || null;
        } else {
            paymentMethods = storeData.paymentMethods.defaultPaymentMethods || null;
        }
    }

    const methods: PaymentMethodType[] = [];

    if (isStripeEnabled) {
        methods.push({
            isOnline: true,
            id: 'stripe',
            name: 'Pay online',
            description: 'Stripe checkout (Credit/Debit Card, Apple Pay, Google Pay, Link...)',
            icon: 'CreditCard'
        });
    }

    if (hasChargablePaymentMethod) {
        if (paymentMethods?.cash) {
            methods.push({
                isOnline: false,
                id: 'cash',
                name: 'Cash',
                description: currentOrderType === 'delivery' ? 'Pay with cash on delivery' : 'Pay with cash at pickup',
                icon: 'Banknote'
            });
        }
        if (paymentMethods?.cardTerminal) {
            methods.push({
                isOnline: false,
                id: 'cardTerminal',
                name: 'Card',
                description: currentOrderType === 'delivery' ? 'Pay with card on delivery' : 'Pay with card at pickup',
                icon: 'Calculator'
            });
        }
        if (paymentMethods?.customMethods) {
            paymentMethods.customMethods.forEach((method: CustomPaymentMethod) => {
                if (method.isActive && method.name) {
                    methods.push({
                        isOnline: false,
                        id: method.id || crypto.randomUUID(),
                        name: method.name,
                        description: method.description,
                    });
                }
            });
        }
    }
    return methods;
}