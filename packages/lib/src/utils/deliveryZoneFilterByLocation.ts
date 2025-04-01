import type { Point, DeliveryZone } from "@lib/types/storeTypes";
import { isInsideCircle } from "./isInsideCircle";
import { isInsideRectangle } from "./isInsideRectangle";
import { isInsidePolygon } from "./isInsidePolygon";

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