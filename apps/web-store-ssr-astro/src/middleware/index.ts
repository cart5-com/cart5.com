import { sequence } from "astro:middleware";
import { authMiddleware } from "./auth";
import { csrfMiddleware } from "./csrf";
import { versionMiddleware } from "./version";


export const onRequest = sequence(
    csrfMiddleware,
    authMiddleware,
    versionMiddleware,
);
