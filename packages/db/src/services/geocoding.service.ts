import db from "@db/drizzle";
import { geocodingCacheTable } from "@db/schema/geocoding.schema";
import { eq } from "drizzle-orm";

export const saveGeocodingCache_Service = async (
    url: string,
    response: google.maps.GeocoderResponse
) => {
    return await db.insert(geocodingCacheTable)
        .values({
            url,
            response,
        })
        .returning()
        .then(results => results[0]);
};

export const getGeocodingCache_Service = async (url: string) => {
    return await db.select()
        .from(geocodingCacheTable)
        .where(eq(geocodingCacheTable.url, url))
        .then(results => results[0]);
};
