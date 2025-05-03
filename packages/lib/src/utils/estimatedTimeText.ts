import type { OrderType } from "@lib/types/orderType";
import type { EstimatedTime } from "@lib/zod/deliverySchema";

export const estimatedTimeText = (
    currentOrderType: OrderType,
    deliveryZoneEstimatedTime?: EstimatedTime,
    defaultEstimatedDeliveryTime?: EstimatedTime,
    defaultEstimatedPickupTime?: EstimatedTime
) => {
    const isDelivery = currentOrderType === 'delivery';
    const time = isDelivery
        ? (deliveryZoneEstimatedTime ||
            defaultEstimatedDeliveryTime)
        : (defaultEstimatedPickupTime);

    if (!time) return null;

    const times = [
        time.min,
        time.max
    ].filter(Boolean);

    const timeLabel = isDelivery ? 'Estimated Delivery Time' : 'Estimated Preparation Time';
    return times.length ? `${timeLabel}: ${times.join('-')} ${time.unit || ''}` : null;
}