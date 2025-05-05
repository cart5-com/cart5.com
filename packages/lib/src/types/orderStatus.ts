

export const ORDER_STATUS = [
    // DO NOT SHOW IN STORE ORDERS UI
    "PENDING_PAYMENT",   // Initial state when online paid order is created 
    "CREATED",           // created by customer
    "PREPARING",         // Order is being prepared
    "REJECTED",          // Store has rejected the order
    "COMPLETED",         // Order fulfilled and completed
    "CANCELLED",         // Order was cancelled
    "REFUNDED",          // Order was refunded
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number];
export const ORDER_STATUS_OBJ = ORDER_STATUS.reduce((acc, status) => {
    acc[status] = status;
    return acc;
}, {} as Record<OrderStatus, OrderStatus>);

console.log("ORDER_STATUS_OBJ...")
console.log(ORDER_STATUS_OBJ)