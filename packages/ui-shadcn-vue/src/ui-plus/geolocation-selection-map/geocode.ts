import { gmapsApiClient } from '@api-client/gmaps';
import type { ResType } from '@api-client/typeUtils';

type GeocodeResponse = ResType<
    typeof gmapsApiClient.geocode['$get']
>;

export const geocode = async (address: string, countryCode?: string): Promise<GeocodeResponse> => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
        const cacheKey = `_geocode_${address.trim().toLowerCase()}_${countryCode || ''}`;
        const cachedResult = localStorage.getItem(cacheKey);

        // If we have a cached result and it's not expired, return it
        if (cachedResult) {
            try {
                const { data, timestamp } = JSON.parse(cachedResult) as { data: GeocodeResponse, timestamp: number };
                // Check if the cache is still valid (30 days = 31536000000 ms)
                if (Date.now() - timestamp < 31_536_000_000) {
                    return data;
                }
            } catch (error) {
                // If there's an error parsing the cached data, ignore it and fetch fresh data
                console.error('Error parsing cached geocode data:', error);
            }
        }

        // If no valid cache exists, fetch new data
        const result = await (await gmapsApiClient.geocode.$get({
            query: {
                address: address.trim().toLowerCase(),
                components: countryCode ? `country:${countryCode}` : undefined,
            }
        })).json();
        if (!result.error && result.data.results.length > 0) {
            // Cache the result
            localStorage.setItem(cacheKey, JSON.stringify({
                data: result,
                timestamp: Date.now()
            }));
        }


        return result;
    }

    // If not in browser, just fetch without caching
    return await (await gmapsApiClient.geocode.$get({
        query: {
            address: address.trim().toLowerCase(),
            components: countryCode ? `country:${countryCode}` : undefined,
        }
    })).json();
}