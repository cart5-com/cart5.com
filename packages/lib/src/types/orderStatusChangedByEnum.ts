export const ORDER_STATUS_CHANGED_BY = [
    "user",
    "automatic_rule",
    "system",
    "stripe-webhook"
] as const;

export type OrderStatusChangedByType = (typeof ORDER_STATUS_CHANGED_BY)[number];
