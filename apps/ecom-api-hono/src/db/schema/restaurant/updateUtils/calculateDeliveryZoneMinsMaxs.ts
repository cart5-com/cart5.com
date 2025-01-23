import type { DeliveryZone, Point } from "lib/types/restaurantTypes";

export const calculateDeliveryZoneMinsMaxs = (deliveryZones: DeliveryZone[]) => {
    if (!deliveryZones.length) {
        return {
            minLat: null,
            maxLat: null,
            minLng: null,
            maxLng: null,
        };
    }

    let points: Point[] = [];

    // Collect all points from different shape types
    deliveryZones.forEach(zone => {
        if (!zone.isActive) return;

        switch (zone.shapeType) {
            case 'polygon':
                if (zone.polygonArea) {
                    points.push(...zone.polygonArea);
                }
                break;

            case 'circle':
                if (zone.circleArea) {
                    const { center, radius } = zone.circleArea;
                    // Convert radius from meters to degrees
                    // Latitude: 1 degree = 111,111 meters
                    const latDegrees = radius / 111111;

                    // Longitude: 1 degree = 111,111 * cos(latitude) meters
                    const lngDegrees = radius / (111111 * Math.cos(center.lat * Math.PI / 180));

                    points.push(
                        { lat: center.lat + latDegrees, lng: center.lng + lngDegrees }, // North-East
                        { lat: center.lat + latDegrees, lng: center.lng - lngDegrees }, // North-West
                        { lat: center.lat - latDegrees, lng: center.lng + lngDegrees }, // South-East
                        { lat: center.lat - latDegrees, lng: center.lng - lngDegrees }  // South-West
                    );
                }
                break;

            case 'rectangle':
                if (zone.rectangleArea) {
                    const { topLeft, bottomRight } = zone.rectangleArea;
                    points.push(
                        topLeft,
                        bottomRight,
                        { lat: topLeft.lat, lng: bottomRight.lng },    // topRight
                        { lat: bottomRight.lat, lng: topLeft.lng }     // bottomLeft
                    );
                }
                break;
        }
    });

    if (!points.length) {
        return {
            minLat: null,
            maxLat: null,
            minLng: null,
            maxLng: null,
        };
    }

    return {
        minLat: Math.min(...points.map(p => p.lat)),
        maxLat: Math.max(...points.map(p => p.lat)),
        minLng: Math.min(...points.map(p => p.lng)),
        maxLng: Math.max(...points.map(p => p.lng)),
    };
};