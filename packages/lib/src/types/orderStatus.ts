

export const ORDER_STATUS = [
    "PENDING_PAYMENT_AUTHORIZATION",   // Initial state when online paid order is created // DO NOT SHOW IN STORE ORDERS UI
    "CREATED",           // created by customer
    "ACCEPTED",         // Order is accepted by store and being prepared 
    // TODO: mark all "ACCEPTED" orders as "COMPLETED" after 4 hours
    "COMPLETED",         // Order completed
    // TODO: archive all "COMPLETED" orders after 24 hours

    "CANCELLED",         // Order was cancelled by store
    // user is not allow to cancel. but may call the store to cancel
] as const;


export type OrderStatus = (typeof ORDER_STATUS)[number];
export const ORDER_STATUS_OBJ = ORDER_STATUS.reduce((acc, status) => {
    acc[status] = status;
    return acc;
}, {} as Record<OrderStatus, OrderStatus>);


// ORDER FLOW DETAILS
// Stripe payment orders are "PENDING_PAYMENT_AUTHORIZATION"
// checkout link is expired after 1 hour
// once payment confirmed order created_at_ts will be updated and order status will be "CREATED"

// TODO: online paid orders are only a authorization to charge the customer later by confirming the payment.
// these authoriztions must be confirmed after 12 hours if COMPLETED, else CANCELLED

// all other payment methods are "CREATED" by default

// store orders view is showing only last 24 hours orders (order.service -> getRecentOrders_Service)
// TODO: all "CREATED" orders expected to be "ACCEPTED" in 25 minutes (by a user or automatic rule), 
// else order must be "CANCELLED" and notify the customer


/*/
== Status types from Stripe ==

type PaymentIntentStatus =
        | 'canceled'
        | 'processing'
        | 'requires_action'
        | 'requires_capture'
        | 'requires_confirmation'
        | 'requires_payment_method'
        | 'succeeded';

type CheckoutSessionStatus = 'complete' | 'expired' | 'open';

type CheckoutSessionPaymentStatus = 'no_payment_required' | 'paid' | 'unpaid'; 
// I use manual capture so CheckoutSessionPaymentStatus is "unpaid" after checkout session status is "complete"

/*/
