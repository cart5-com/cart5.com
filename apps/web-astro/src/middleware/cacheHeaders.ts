import { defineMiddleware } from "astro:middleware";

export const cacheHeadersMiddleware = defineMiddleware(async ({ request }, next) => {
    const response = await next();
    if (import.meta.env.PROD) {
        if (request.url.includes('/_actions/')) {
            // do not cache actions, use them for user private data
        } else if (request.url.includes('/_server-islands/')) {
            // do not cache server islands, use them for user private data
        } else if (
            response.status === 200 ||
            response.status === 404
        ) {
            // 5 min cache, 10 min stale, better than no cache
            response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
        }
        response.headers.set('ETag', `"${import.meta.env.SOURCE_COMMIT || 'DEV'}"`);
    }
    return response;
});
