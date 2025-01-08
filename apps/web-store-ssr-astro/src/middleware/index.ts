import { sequence } from "astro:middleware";
// import { authMiddleware } from "./auth";
import { csrfMiddleware } from "./csrf";
import { cacheHeadersMiddleware } from "./cacheHeaders";


export const onRequest = sequence(
    csrfMiddleware,
    // authMiddleware,
    cacheHeadersMiddleware,
);
