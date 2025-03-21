import { apiClient } from '@api-client/index';

export const geocode = async (address: string, countryCode?: string) => {
    return await (await apiClient.gmaps.geocode.$get({
        query: {
            address: address.trim().toLowerCase(),
            components: countryCode ? `country:${countryCode}` : undefined,
        }
    })).json();
}