import { sequence } from "astro:middleware";
import { csrfMiddleware } from "./csrf";
import { cacheHeadersMiddleware } from "./cacheHeaders";
import { websiteIdMiddleware } from "./websiteId";


export const onRequest = sequence(
    csrfMiddleware,
    cacheHeadersMiddleware,
    websiteIdMiddleware
);
