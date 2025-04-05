import type { Point, Circle } from "@lib/zod/deliverySchema";
import { calculateDistance } from "./calculateDistance";

export function isInsideCircle(point: Point, circle: Circle) {
    // Check if the circle has valid properties
    if (!circle.center?.lat || !circle.center?.lng || !circle.radius) {
        return false;
    }

    if (!point.lat || !point.lng) {
        return false;
    }

    // Calculate the distance between the point and the center of the circle
    const distance = calculateDistance(point, circle.center);

    // Check if the distance is less than or equal to the radius (converted to km)
    return distance <= circle.radius / 1000;
} 