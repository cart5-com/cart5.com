

export const ORDER_STATUS = [
    "PENDING_PAYMENT_AUTHORIZATION",   // Initial state when online paid order is created // DO NOT SHOW IN STORE ORDERS UI
    "CREATED",           // created by customer
    "ACCEPTED",         // Order is accepted by store and being prepared 
    // TODO: mark all "ACCEPTED" orders as "COMPLETED" after 4 hours
    "COMPLETED",         // Order completed
    // TODO: archive all "COMPLETED" orders after 48 hours

    "CANCELLED",         // Order was cancelled by store
    // user is not allow to cancel. but may call the store to cancel
] as const;
// TODO: online paid orders are only a authorization to charge the customer later by confirming the payment.
// these authoriztions must be confirmed after 12 hours if COMPLETED, else CANCELLED

export type OrderStatus = (typeof ORDER_STATUS)[number];
export const ORDER_STATUS_OBJ = ORDER_STATUS.reduce((acc, status) => {
    acc[status] = status;
    return acc;
}, {} as Record<OrderStatus, OrderStatus>);
