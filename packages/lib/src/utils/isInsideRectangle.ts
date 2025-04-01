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

    // Calculate min and max lat/lng from the rectangle corners
    const minLat = Math.min(rectangle.topLeft.lat, rectangle.bottomRight.lat);
    const maxLat = Math.max(rectangle.topLeft.lat, rectangle.bottomRight.lat);
    const minLng = Math.min(rectangle.topLeft.lng, rectangle.bottomRight.lng);
    const maxLng = Math.max(rectangle.topLeft.lng, rectangle.bottomRight.lng);

    // Check if the point is within the bounds of the rectangle
    return (
        point.lat >= minLat &&
        point.lat <= maxLat &&
        point.lng >= minLng &&
        point.lng <= maxLng
    );
} 