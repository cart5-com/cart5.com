import type { DeliveryZone, Point } from "@lib/types/restaurantTypes";

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
                    const latDegrees = radius ? radius / 111111 : 0;

                    if (center?.lat && center?.lng) {
                        // Longitude: 1 degree = 111,111 * cos(latitude) meters
                        const lngDegrees = radius ? radius / (111111 * Math.cos(center.lat * Math.PI / 180)) : 0;

                        points.push(
                            { lat: center.lat + latDegrees, lng: center.lng + lngDegrees }, // North-East
                            { lat: center.lat + latDegrees, lng: center.lng - lngDegrees }, // North-West
                            { lat: center.lat - latDegrees, lng: center.lng + lngDegrees }, // South-East
                            { lat: center.lat - latDegrees, lng: center.lng - lngDegrees }  // South-West
                        );
                    }
                }
                break;

            case 'rectangle':
                if (zone.rectangleArea) {
                    const { topLeft, bottomRight } = zone.rectangleArea;
                    if (topLeft?.lat && topLeft?.lng && bottomRight?.lat && bottomRight?.lng) {
                        points.push(
                            topLeft,
                            bottomRight,
                            { lat: topLeft.lat, lng: bottomRight.lng },    // topRight
                            { lat: bottomRight.lat, lng: topLeft.lng }     // bottomLeft
                        );
                    }
                }
                break;
        }
    });

    const validPoints = points.filter(p => p.lat != null && p.lng != null);
    if (!validPoints.length) {
        return {
            minLat: null,
            maxLat: null,
            minLng: null,
            maxLng: null,
        };
    }

    return {
        minLat: Math.min(...validPoints.map(p => p.lat!)),
        maxLat: Math.max(...validPoints.map(p => p.lat!)),
        minLng: Math.min(...validPoints.map(p => p.lng!)),
        maxLng: Math.max(...validPoints.map(p => p.lng!)),
    };
};

export const processDataToSaveDeliveryZones = (data: {
    zones?: DeliveryZone[] | undefined;
    minLat?: number | null | undefined;
    maxLat?: number | null | undefined;
    minLng?: number | null | undefined;
    maxLng?: number | null | undefined;
}) => {
    if (data.zones) {
        const { minLat, maxLat, minLng, maxLng } = calculateDeliveryZoneMinsMaxs(
            data.zones
        );
        const deliveryZoneDataWithMinsMaxs = {
            ...data,
            minLat,
            maxLat,
            minLng,
            maxLng
        }
        return deliveryZoneDataWithMinsMaxs;
    } else {
        return data;
    }
}