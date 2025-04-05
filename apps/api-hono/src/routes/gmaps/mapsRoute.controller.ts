/// <reference types="@types/google.maps" />

import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { type HonoVariables } from "@api-hono/types/HonoVariables";
import { type ErrorType } from "@lib/types/errors";
import { getEnvVariable, IS_PROD } from "@lib/utils/getEnvVariable";
import { verifyRequestOrigin } from "@lib/utils/verifyRequestOrigin";
import { getGeocodingCache_Service, saveGeocodingCache_Service } from "@db/services/geocoding.service";

// function generateSessionToken() {
//     const fourHours = 14400000; //4 * 60 * 60 * 1000; // 4 hours in milliseconds
//     const currentTime = Date.now();
//     const result = Math.floor(currentTime / fourHours).toString(16);
//     return result + result;
// }

const cacheControl = IS_PROD ? 'public, max-age=2592000, immutable' : 'no-cache'; // 30 days cache
const REQUIRED_HEADERS = ['sec-fetch-dest', 'sec-fetch-mode', 'sec-fetch-site'] as const;

export const apiGMaps = new Hono<HonoVariables>()
    .basePath('/gmaps')
    .use(async (c, next) => {
        c.header('Cache-Control', cacheControl);
        const headers = c.req.header();

        // 1. Check if all required Sec-Fetch headers are present
        const missingHeaders = REQUIRED_HEADERS.filter(header => !headers[header]);
        if (missingHeaders.length > 0) {
            return c.body("Invalid request: Missing security headers", 403);
        }

        // 2. Validate Sec-Fetch headers values
        if (headers['sec-fetch-mode'] !== 'cors' ||
            headers['sec-fetch-dest'] !== 'empty' ||
            !['same-origin', 'same-site'].includes(headers['sec-fetch-site'])) {
            return c.body("Invalid request: Invalid security headers", 403);
        }

        // 3. Check origin/referer
        const referer = headers['referer'];
        const host = headers['host'];

        // if (!refererHeader || !hostHeader || !verifyRequestOrigin(refererHeader, [hostHeader])) {
        if (!referer || !host || !verifyRequestOrigin(referer, [host])) {
            return c.body("Invalid request: Unauthorized origin", 403);
        }
        await next();
    })


    // docs: https://developers.google.com/maps/documentation/geocoding/requests-geocoding
    .get(
        '/geocode',
        zValidator('query', z.object({
            address: z.string().min(2, { message: "address is required" }),
            components: z.string().optional(),
            language: z.string().optional(),
            region: z.string().optional(),
        })),
        async (c) => {
            const {
                // address,
                // components, language, region
            } = c.req.valid('query');
            let reqUrl = new URL(c.req.url);
            reqUrl.protocol = 'https';
            reqUrl.hostname = 'maps.googleapis.com';
            reqUrl.pathname = '/maps/api/geocode/json';
            reqUrl.searchParams.delete('key');
            reqUrl.searchParams.append('key', getEnvVariable("GOOGLE_MAPS_KEY")!);

            // Check if the request is cached
            // Create a cache key without the API key for security
            const cacheKeyUrl = new URL(reqUrl.toString());
            cacheKeyUrl.searchParams.delete('key');
            const cacheKey = cacheKeyUrl.toString();
            const cachedResult = await getGeocodingCache_Service(cacheKey);

            if (
                cachedResult &&
                cachedResult.response &&
                cachedResult.response.results.length > 0
            ) {
                // 30 days
                const isExpired = cachedResult.created_at_ts + 31_536_000_000 < Date.now();
                // Use cached response
                if (!isExpired) {
                    return c.json({
                        data: cachedResult.response as google.maps.GeocoderResponse,
                        error: null as ErrorType,
                        fromCache: true,
                    }, 200);
                }
            }

            // Fetch from Google Maps API
            const response = (await (await fetch(reqUrl.toString())).json()) as google.maps.GeocoderResponse;

            // Cache the response
            if (response && typeof response === 'object' && 'status' in response && response.status === 'OK') {
                await saveGeocodingCache_Service(cacheKey, response);
            }

            return c.json({
                data: response as google.maps.GeocoderResponse,
                error: null as ErrorType,
                fromCache: false,
            }, 200);
        }
    )



// docs: https://developers.google.com/maps/documentation/places/web-service/autocomplete
// export type predictionType = ResType<
//     Awaited<
//         ReturnType<typeof createEcomApiMapsClient>['api']['maps']['gmaps']['autocomplete']['$get']
//     >
// >['data']['predictions'][number];
// .get(
//     '/autocomplete',
//     zValidator('query', z.object({
//         input: z.string().min(2, { message: "input required" }),
//         components: z.string().optional(),
//         language: z.string().optional(),
//         location: z.string().optional(),
//         locationbias: z.string().optional(),
//         locationrestriction: z.string().optional(),
//         offset: z.string().optional(),
//         origin: z.string().optional(),
//         radius: z.string().optional(),
//         region: z.string().optional(),
//         types: z.string().optional(),
//     })),
//     async (c) => {
//         const {
//             // input,
//             // components, language, location, locationbias,
//             // locationrestriction, offset, origin, radius,
//             // region, types
//         } = c.req.valid('query');
//         let reqUrl = new URL(c.req.url);
//         reqUrl.protocol = 'https';
//         reqUrl.hostname = 'maps.googleapis.com';
//         reqUrl.pathname = '/maps/api/place/autocomplete/json';
//         reqUrl.searchParams.delete('key');
//         reqUrl.searchParams.append('key', getEnvVariable("GOOGLE_MAPS_KEY")!);
//         reqUrl.searchParams.delete('sessiontoken');
//         reqUrl.searchParams.append('sessiontoken', generateSessionToken());
//         const response = (await (await fetch(reqUrl.toString())).json()) as google.maps.places.AutocompleteResponse;

//         return c.json({
//             data: response,
//             error: null as ErrorType
//         }, 200);
//     }
// )



// https://developers.google.com/maps/documentation/geocoding/requests-reverse-geocoding
// .get(
//     '/reverse',
//     zValidator('query', z.object({
//         latlng: z.string(),
//         result_type: z.string().optional(),
//         location_type: z.string().optional(),
//         language: z.string().optional(),
//         region: z.string().optional(),
//     })),
//     async (c) => {
//         const {
//             //latlng,
//             // result_type, location_type, language, region
//         } = c.req.valid('query');
//         let reqUrl = new URL(c.req.url);
//         reqUrl.protocol = 'https';
//         reqUrl.hostname = 'maps.googleapis.com';
//         reqUrl.pathname = '/maps/api/geocode/json';
//         reqUrl.searchParams.delete('key');
//         reqUrl.searchParams.append('key', getEnvVariable("GOOGLE_MAPS_KEY")!);
//         const response = (await (await fetch(reqUrl.toString())).json()) as google.maps.GeocoderResponse;
//         return c.json({
//             data: response,
//             error: null as ErrorType
//         }, 200);
//     }
// )



// // docs: https://developers.google.com/maps/documentation/places/web-service/details
// .get(
//     '/place/details',
//     zValidator('query', z.object({
//         place_id: z.string(),
//         fields: z.string().optional(),
//         language: z.string().optional(),
//         region: z.string().optional(),
//         reviews_no_translations: z.boolean().optional(),
//         reviews_sort: z.string().optional(),
//         sessiontoken: z.string().optional(),
//     })),
//     async (c) => {
//         const {
//             // place_id,
//             // fields, language, region,
//             // reviews_no_translations
//             // reviews_sort
//             // sessiontoken
//         } = c.req.valid('query');
//         let reqUrl = new URL(c.req.url);
//         reqUrl.protocol = 'https';
//         reqUrl.hostname = 'maps.googleapis.com';
//         reqUrl.pathname = '/maps/api/place/details/json';
//         reqUrl.searchParams.delete('key');
//         reqUrl.searchParams.append('key', getEnvVariable("GOOGLE_MAPS_KEY")!);
//         reqUrl.searchParams.delete('sessiontoken');
//         // reqUrl.searchParams.append('sessiontoken', generateSessionToken());
//         const response = (await (await fetch(reqUrl.toString())).json()) as {
//             html_attributions: string[];
//             result: google.maps.places.PlaceResult;
//             status: google.maps.places.PlacesServiceStatus;
//         };
//         return c.json({
//             data: response,
//             error: null as ErrorType
//         }, 200);
//     }
// )



// .get(
//     '/autocomplete-v2',
//     zValidator('query', z.object({
//         address: z.string().min(2, { message: "address is required" }),
//     })),
//     async (c) => {
//         const { address } = c.req.valid('query');
//         const response = await (await fetch('https://places.googleapis.com/v1/places:autocomplete', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-Goog-Api-Key': ENV.MAPS_GOOGLE_KEY
//             },
//             body: JSON.stringify({
//                 input: address,
//                 sessionToken: c.get('MAPS_SESSION_TOKEN'),
//             })
//         })).json();
//         return c.json({
//             data: response
//         }, 200);
//     }
// )

export type ApiGmapsRouteType = typeof apiGMaps;

