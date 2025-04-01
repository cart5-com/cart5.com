import type { Point, DeliveryZone } from "@lib/types/storeTypes";
import { roundTo2Decimals } from "./roundTo2Decimals";
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

export function getBestDeliveryZone(
    userLocation: Point,
    deliveryZones: DeliveryZone[],
    storeLocation: Point
) {
    const availableZones = deliveryZoneFilterByLocation(userLocation, deliveryZones);
    if (availableZones.length === 0) {
        return null;
    }

    const distance = roundTo2Decimals(calculateDistance(userLocation, storeLocation));

    // Calculate total delivery fees
    const zonesWithFees = availableZones.map((zone) => {
        const baseFee = zone.deliveryFee || 0;
        const distanceFee = zone.deliveryFeePerKm ? zone.deliveryFeePerKm * distance : 0;
        const totalDeliveryFee = roundTo2Decimals(baseFee + distanceFee);

        return {
            ...zone,
            totalDeliveryFee: totalDeliveryFee,
            distanceFromStoreKm: distance
        };
    });

    // First sort by delivery fee, then by minimum cart as a tiebreaker
    zonesWithFees.sort((a, b) => {
        // First compare by delivery fee
        const feeDiff = a.totalDeliveryFee! - b.totalDeliveryFee!;

        // If fees are the same (or very close), use minCart as tiebreaker
        if (Math.abs(feeDiff) < 0.01) {
            return (a.minCart || 0) - (b.minCart || 0);
        }

        return feeDiff;
    });

    return zonesWithFees[0] || null;
}