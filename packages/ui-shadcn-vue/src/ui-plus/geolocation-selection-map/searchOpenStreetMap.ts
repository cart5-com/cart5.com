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

    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
        const cacheKey = `osm_${addressQuery.trim().toLowerCase()}_${countrySelectElemValue || ''}`;
        const cachedResult = localStorage.getItem(cacheKey);

        // If we have a cached result and it's not expired, return it
        if (cachedResult) {
            try {
                const { data, timestamp } = JSON.parse(cachedResult) as {
                    data: { lat: number; lng: number; label: string }[],
                    timestamp: number
                };
                // Check if the cache is still valid (1 year = 31536000000 ms)
                if (Date.now() - timestamp < 31_536_000_000) {
                    return data;
                }
            } catch (error) {
                // If there's an error parsing the cached data, ignore it and fetch fresh data
                console.error('Error parsing cached OpenStreetMap data:', error);
            }
        }

        // If no valid cache exists, fetch new data
        const response = await fetch(url);
        const result = await response.json();
        const mappedResult = result.map((item: { lat: number; lon: number; display_name: string }) => {
            return {
                lat: item.lat,
                lng: item.lon,
                label: item.display_name
            };
        });

        // Cache the result
        localStorage.setItem(cacheKey, JSON.stringify({
            data: mappedResult,
            timestamp: Date.now()
        }));

        return mappedResult;
    }

    // If not in browser, just fetch without caching
    const response = await fetch(url);
    return (await response.json()).map((item: { lat: number; lon: number; display_name: string }) => {
        return {
            lat: item.lat,
            lng: item.lon,
            label: item.display_name
        };
    });
}