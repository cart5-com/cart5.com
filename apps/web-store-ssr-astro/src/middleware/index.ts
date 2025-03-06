import { sequence } from "astro:middleware";
import { csrfMiddleware } from "./csrf";
import { cacheHeadersMiddleware } from "./cacheHeaders";


export const onRequest = sequence(
    csrfMiddleware,
    cacheHeadersMiddleware,
);
