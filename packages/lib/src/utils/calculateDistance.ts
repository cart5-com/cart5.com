import type { Point } from "@lib/types/restaurantTypes";

export function calculateDistance(
    point1: Point,
    point2: Point,
    measure: 'km' | 'mi' = 'km'
) {
    if (!point1.lat || !point1.lng || !point2.lat || !point2.lng) {
        throw new Error('Invalid point');
    }
    const radius = measure === 'km' ? 6371 : 3959; // Earth radius in km or miles
    const DEG_TO_RAD = 0.017453292519943295; // PI/180

    return radius * 2 * Math.asin(
        Math.sqrt(
            0.5 - Math.cos((point2.lat - point1.lat) * DEG_TO_RAD) / 2 +
            Math.cos(point1.lat * DEG_TO_RAD) * Math.cos(point2.lat * DEG_TO_RAD) *
            (1 - Math.cos((point2.lng - point1.lng) * DEG_TO_RAD)) / 2
        )
    );
}