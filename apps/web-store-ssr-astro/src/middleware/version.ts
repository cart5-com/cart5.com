import { defineMiddleware } from "astro:middleware";

export const versionMiddleware = defineMiddleware(async (context, next) => {
    const response = await next();
    // Add git hash to response headers
    response.headers.set('X-Source-Version', import.meta.env.SOURCE_COMMIT || 'dev');
    return response;
});