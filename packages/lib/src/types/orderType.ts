export const ORDER_TYPE = ["pickup", "delivery"] as const;
export type OrderType = (typeof ORDER_TYPE)[number];