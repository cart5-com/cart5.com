
export const searchOpenStreetMap = async (addressQuery: string,
    countrySelectElemValue?: string
): Promise<{ lat: number; lng: number; label: string }[]> => {
    // https://nominatim.org/release-docs/latest/api/Search/
    const url =
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(addressQuery)}&` +
        `limit=40&` +
        `addressdetails=1&` +
        `extratags=1&` +
        `namedetails=1&` +
        (countrySelectElemValue ? `countrycodes=${countrySelectElemValue.toLowerCase()}&` : "") +
        `format=json`;
    const response = await fetch(url);
    return (await response.json()).map((item: { lat: number; lon: number; display_name: string }) => {
        return {
            lat: item.lat,
            lng: item.lon,
            label: item.display_name
        };
    });
}