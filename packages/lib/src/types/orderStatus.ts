export const ORDER_STATUS = [
    "CREATED",           // created by customer
    "PENDING",           // Initial state when order is created
    "ACCEPTED",          // Store has accepted the order
    "REJECTED",          // Store has rejected the order
    "PREPARING",         // Order is being prepared
    "COMPLETED",         // Order fulfilled and completed
    "CANCELLED",         // Order was cancelled
    "REFUNDED",          // Order was refunded
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number];