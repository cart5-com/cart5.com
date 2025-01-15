/// <reference types="@types/google.maps" />

import { Hono } from "hono";
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { type HonoVariables } from "../index";
import { type ErrorType } from "lib/errors";
import { getOptionalEnvVariable, IS_PROD } from "lib/utils/getEnvVariable";

function generateSessionToken() {
    const fourHours = 14400000; //4 * 60 * 60 * 1000; // 4 hours in milliseconds
    const currentTime = Date.now();
    const result = Math.floor(currentTime / fourHours).toString(16);
    return result + result;
}

const cacheControl = IS_PROD ? 'public, max-age=2592000, immutable' : 'no-cache'; // 30 days cache

export const mapsRoute = new Hono<HonoVariables>()
    // docs: https://developers.google.com/maps/documentation/places/web-service/autocomplete
    .get(
        '/autocomplete',
        zValidator('query', z.object({
            input: z.string().min(2, { message: "input required" }),
            components: z.string().optional(),
            language: z.string().optional(),
            location: z.string().optional(),
            locationbias: z.string().optional(),
            locationrestriction: z.string().optional(),
            offset: z.string().optional(),
            origin: z.string().optional(),
            radius: z.string().optional(),
            region: z.string().optional(),
            types: z.string().optional(),
        })),
        async (c) => {
            const {
                // input,
                // components, language, location, locationbias,
                // locationrestriction, offset, origin, radius,
                // region, types
            } = c.req.valid('query');
            let reqUrl = new URL(c.req.url);
            reqUrl.protocol = 'https';
            reqUrl.hostname = 'maps.googleapis.com';
            reqUrl.pathname = '/maps/api/place/autocomplete/json';
            reqUrl.searchParams.delete('key');
            reqUrl.searchParams.append('key', getOptionalEnvVariable("GOOGLE_MAPS_KEY")!);
            reqUrl.searchParams.delete('sessiontoken');
            reqUrl.searchParams.append('sessiontoken', generateSessionToken());
            c.header('Cache-Control', cacheControl);
            const response = (await (await fetch(reqUrl.toString())).json()) as google.maps.places.AutocompleteResponse;

            return c.json({
                data: response,
                error: null as ErrorType
            }, 200);
        }
    )
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
            reqUrl.searchParams.append('key', getOptionalEnvVariable("GOOGLE_MAPS_KEY")!);
            c.header('Cache-Control', cacheControl);
            const response = (await (await fetch(reqUrl.toString())).json()) as google.maps.GeocoderResponse;
            // (response as any).userIp = c.req.header('caddy-user-ip') || "";
            // (response as any).dateTs = Date.now();
            return c.json({
                data: response,
                error: null as ErrorType
            }, 200);
        }
    )
    // docs: https://developers.google.com/maps/documentation/places/web-service/details
    .get(
        '/place/details',
        zValidator('query', z.object({
            place_id: z.string(),
            fields: z.string().optional(),
            language: z.string().optional(),
            region: z.string().optional(),
            reviews_no_translations: z.boolean().optional(),
            reviews_sort: z.string().optional(),
            sessiontoken: z.string().optional(),
        })),
        async (c) => {
            const {
                // place_id,
                // fields, language, region,
                // reviews_no_translations
                // reviews_sort
                // sessiontoken
            } = c.req.valid('query');
            let reqUrl = new URL(c.req.url);
            reqUrl.protocol = 'https';
            reqUrl.hostname = 'maps.googleapis.com';
            reqUrl.pathname = '/maps/api/place/details/json';
            reqUrl.searchParams.delete('key');
            reqUrl.searchParams.append('key', getOptionalEnvVariable("GOOGLE_MAPS_KEY")!);
            reqUrl.searchParams.delete('sessiontoken');
            c.header('Cache-Control', cacheControl);
            // reqUrl.searchParams.append('sessiontoken', generateSessionToken());
            const response = (await (await fetch(reqUrl.toString())).json()) as {
                html_attributions: string[];
                result: google.maps.places.PlaceResult;
                status: google.maps.places.PlacesServiceStatus;
            };
            return c.json({
                data: response,
                error: null as ErrorType
            }, 200);
        }
    )
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
//         c.header('Cache-Control', cacheControl);
//         return c.json({
//             data: response
//         }, 200);
//     }
// )
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
//         const { latlng,
//             // result_type, location_type, language, region
//         } = c.req.valid('query');
//         let reqUrl = new URL(c.req.url);
//         reqUrl.protocol = 'https';
//         reqUrl.hostname = 'maps.googleapis.com';
//         reqUrl.pathname = '/maps/api/geocode/json';
//         reqUrl.searchParams.delete('key');
//         reqUrl.searchParams.append('key', ENV.MAPS_GOOGLE_KEY);
//         c.header('Cache-Control', cacheControl);
//         const response = (await (await fetch(reqUrl.toString())).json()) as google.maps.GeocoderResponse;
//         return c.json({
//             data: response,
//             error: null as ErrorType
//         }, 200);
//     }
// )
