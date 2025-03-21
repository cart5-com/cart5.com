
// https://ipwho.is
// alternative: https://workers.cloudflare.com/cf.json // nope it is not working, CORS errors
// alternative: https://ip2c.org/self
// alternative: https://geolocation.onetrust.com/cookieconsentpub/v1/geo/location
export const ipwhois = async (): Promise<IpWhoResponse> => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
        const cacheKey = 'ipwhois_data';
        const cachedResult = sessionStorage.getItem(cacheKey);

        // If we have a cached result and it's not expired, return it
        if (cachedResult) {
            try {
                const { data, timestamp } = JSON.parse(cachedResult) as { data: IpWhoResponse, timestamp: number };
                // Check if the cache is still valid (3 hours = 10800000 ms)
                if (Date.now() - timestamp < 10_800_000) {
                    return data;
                }
            } catch (error) {
                // If there's an error parsing the cached data, ignore it and fetch fresh data
                console.error('Error parsing cached ipwhois data:', error);
            }
        }

        // If no valid cache exists, fetch new data
        const result = await (await fetch('https://ipwho.is')).json();

        // Cache the result in sessionStorage
        sessionStorage.setItem(cacheKey, JSON.stringify({
            data: result,
            timestamp: Date.now()
        }));

        return result;
    }

    // If not in browser, just fetch without caching
    return await (await fetch('https://ipwho.is')).json();
}

export interface IpWhoResponse {
    About_Us?: string
    ip: string
    success: true
    type?: string
    continent?: string
    continent_code?: string
    country?: string
    country_code?: string
    region?: string
    region_code?: string
    city?: string
    latitude?: number
    longitude?: number
    is_eu?: boolean
    postal?: string
    calling_code?: string
    capital?: string
    borders?: string
    flag: {
        img?: string
        emoji?: string
        emoji_unicode?: string
    }
    connection: {
        asn?: number
        org?: string
        isp?: string
        domain?: string
    }
    timezone: {
        id?: string
        abbr?: string
        is_dst?: boolean
        offset?: number
        utc?: string
        current_time?: string
    }
}