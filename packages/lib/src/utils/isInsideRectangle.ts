import type { Point, Rectangle } from "@lib/types/storeTypes";

export function isInsideRectangle(point: Point, rectangle: Rectangle) {
    // Check if the rectangle has valid properties
    if (!rectangle.topLeft?.lat || !rectangle.topLeft?.lng ||
        !rectangle.bottomRight?.lat || !rectangle.bottomRight?.lng) {
        return false;
    }

    if (!point.lat || !point.lng) {
        return false;
    }

    // Check if the point is within the bounds of the rectangle
    return (
        point.lat >= rectangle.bottomRight.lat &&
        point.lat <= rectangle.topLeft.lat &&
        point.lng >= rectangle.topLeft.lng &&
        point.lng <= rectangle.bottomRight.lng
    );
} 