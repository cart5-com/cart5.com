import type { Point, DeliveryZone } from "@lib/types/storeTypes";
import { isInsideCircle } from "./isInsideCircle";
import { isInsideRectangle } from "./isInsideRectangle";
import { isInsidePolygon } from "./isInsidePolygon";
import { calculateDistance } from "./calculateDistance";

export function deliveryZoneFilterByLocation(userLocation: Point, deliveryZones: DeliveryZone[]) {
    return deliveryZones.filter(zone => zone.isActive).filter((zone) => {
        if (zone.shapeType === 'circle') {
            return isInsideCircle(userLocation, zone.circleArea!);
        } else if (zone.shapeType === 'rectangle') {
            return isInsideRectangle(userLocation, zone.rectangleArea!);
        } else if (zone.shapeType === 'polygon') {
            return isInsidePolygon(userLocation, zone.polygonArea!);
        }
        return false;
    });
}

export function getCheapestDeliveryZone(
    userLocation: Point,
    deliveryZones: DeliveryZone[],
    storeLocation: Point
) {
    // Get all zones that contain the user location
    const availableZones = deliveryZoneFilterByLocation(userLocation, deliveryZones);

    if (availableZones.length === 0) {
        return null;
    }

    // Calculate distance once outside the loop
    const distance = calculateDistance(userLocation, storeLocation);

    // Calculate total delivery fee for each zone
    return availableZones.reduce((cheapest, zone) => {
        // Get base delivery fee
        const baseFee = zone.deliveryFee || 0;

        // Calculate distance-based fee if applicable
        let distanceFee = 0;
        if (zone.deliveryFeePerKm) {
            distanceFee = zone.deliveryFeePerKm * distance;
        }

        // Total fee for this zone
        const totalFee = baseFee + distanceFee;

        // If this is our first zone or this zone is cheaper than current cheapest
        if (!cheapest || totalFee < (cheapest.calculatedFee || 0)) {
            return {
                ...zone,
                calculatedFee: totalFee,
                distanceFromStore: distance
            };
        }

        return cheapest;
    }, null as (DeliveryZone & { calculatedFee?: number, distanceFromStore?: number }) | null);
}