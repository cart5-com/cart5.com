type GeocoderResponse = Awaited<ReturnType<typeof import("@api-hono/routes/gmaps/mapsRoute.controller").handleGeocode>>['data'];
import { calculateDistance } from './calculateDistance';
import { KNOWN_ERROR } from '@lib/types/errors';

export const checkGeocodeDistance = (
    data: GeocoderResponse,
    deliveryAddress: { lat: number, lng: number },
) => {
    const firstResult = data.results[0]
    if (firstResult && !firstResult.partial_match) {
        const geocodedAddress = firstResult;
        const distance = calculateDistance(
            { lat: deliveryAddress.lat!, lng: deliveryAddress.lng! },
            { lat: Number(geocodedAddress.geometry.location.lat), lng: Number(geocodedAddress.geometry.location.lng) }
        );
        if (distance > 0.3) {
            throw new KNOWN_ERROR("Delivery address is too far from geocoded address", "DELIVERY_ADDRESS_TOO_FAR_FROM_GEOCODED_ADDRESS");
        }
    } else {
        throw new KNOWN_ERROR("Delivery address is invalid", "DELIVERY_ADDRESS_INVALID");
    }
}