import type { Point, DeliveryZone } from "@lib/zod/deliverySchema";
import { isInsideCircle } from "./isInsideCircle";
import { isInsideRectangle } from "./isInsideRectangle";
import { isInsidePolygon } from "./isInsidePolygon";
import { calculateDistance } from "./calculateDistance";
import type { TaxSettings } from "@lib/zod/taxSchema";
import { calculateFeeTax } from "./calculateFeeTax";


function deliveryZoneFilterByLocation(userLocation: Point, deliveryZones: DeliveryZone[]) {
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

export function getBestDeliveryZoneWithTaxDetails(
    userLocation: Point,
    deliveryZones: DeliveryZone[],
    storeLocation: Point,
    taxSettings: TaxSettings
) {
    const bestZone = getBestDeliveryZone(
        userLocation,
        deliveryZones,
        storeLocation
    );

    if (!bestZone) {
        return null;
    }

    const tax = calculateFeeTax(bestZone.totalDeliveryFee ?? 0, taxSettings.salesTaxType ?? 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES', taxSettings.taxRateForDelivery ?? 0);
    const itemTotal = taxSettings.salesTaxType === 'ITEMS_PRICES_ALREADY_INCLUDE_TAXES' ? (bestZone.totalDeliveryFee ?? 0) - tax : (bestZone.totalDeliveryFee ?? 0);
    const totalWithTax = itemTotal + tax;
    const shownFee = taxSettings.salesTaxType === 'APPLY_TAX_ON_TOP_OF_PRICES' ? itemTotal : totalWithTax;

    return {
        itemTotal: (itemTotal),
        tax: (tax),
        totalWithTax: (totalWithTax),
        shownFee: (shownFee),
        totalDeliveryFee: bestZone.totalDeliveryFee,
        distanceFromStoreKm: bestZone.distanceFromStoreKm,
        customEstimatedDeliveryTime: bestZone.customEstimatedDeliveryTime,
        minCart: bestZone.minCart,
        // ...bestZone,
    };
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

    const distance = (calculateDistance(userLocation, storeLocation));

    // Calculate total delivery fees
    const zonesWithFees = availableZones.map((zone) => {
        const baseFee = zone.deliveryFee || 0;
        const distanceFee = zone.deliveryFeePerKm ? zone.deliveryFeePerKm * distance : 0;
        const totalDeliveryFee = (baseFee + distanceFee);

        return {
            ...zone,
            totalDeliveryFee: totalDeliveryFee, // without tax
            distanceFromStoreKm: distance
        };
    });

    // First sort by delivery fee, then by minimum cart as a tiebreaker
    zonesWithFees.sort((a, b) => {
        // First compare by delivery fee
        const feeDiff = a.totalDeliveryFee! - b.totalDeliveryFee!;

        // If fees are the same (or very close), use minCart as tiebreaker
        if (Math.abs(feeDiff) < 0.3) {
            return (a.minCart || 0) - (b.minCart || 0);
        }

        return feeDiff;
    });

    return zonesWithFees[0] || null;
}