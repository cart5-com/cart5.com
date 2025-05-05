export const ORDER_STATUS = [
    "CREATED",           // created by customer
    "PENDING_PAYMENT",   // Initial state when order is created
    "PREPARING",         // Order is being prepared
    "REJECTED",          // Store has rejected the order
    "COMPLETED",         // Order fulfilled and completed
    "CANCELLED",         // Order was cancelled
    "REFUNDED",          // Order was refunded
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number];