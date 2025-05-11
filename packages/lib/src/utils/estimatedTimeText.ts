import type { OrderType } from "@lib/types/orderType";
import type { EstimatedTime } from "@lib/zod/deliverySchema";

export const estimatedTimeText = (
    currentOrderType: OrderType,
    deliveryZoneEstimatedTime?: EstimatedTime,
    defaultEstimatedDeliveryTime?: EstimatedTime,
    defaultEstimatedPickupTime?: EstimatedTime
) => {
    return estimatedTimeText1(
        currentOrderType,
        getEstimatedTimeJSON(
            currentOrderType,
            deliveryZoneEstimatedTime,
            defaultEstimatedDeliveryTime,
            defaultEstimatedPickupTime)
    );
}

export const getEstimatedTimeJSON = (
    currentOrderType: OrderType,
    deliveryZoneEstimatedTime?: EstimatedTime,
    defaultEstimatedDeliveryTime?: EstimatedTime,
    defaultEstimatedPickupTime?: EstimatedTime
) => {
    return currentOrderType === 'delivery'
        ? (deliveryZoneEstimatedTime ||
            defaultEstimatedDeliveryTime)
        : (defaultEstimatedPickupTime);
}

export const estimatedTimeText1 = (
    currentOrderType: OrderType,
    estimatedTime: EstimatedTime | undefined,
) => {
    if (!estimatedTime) return null;
    const isDelivery = currentOrderType === 'delivery';
    const times = [
        estimatedTime.min,
        estimatedTime.max
    ].filter(Boolean);
    const timeLabel = isDelivery ? 'Estimated Delivery' : 'Estimated Preparation';
    return times.length ? `${timeLabel}: ${times.join('-')} ${estimatedTime.unit || ''}` : null;
}