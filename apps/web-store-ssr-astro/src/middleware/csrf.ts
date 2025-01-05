import { defineMiddleware } from "astro:middleware";
import { verifyRequestOrigin } from "lib/utils/verifyRequestOrigin";

export const csrfMiddleware = defineMiddleware(async (context, next) => {
    if (context.request.method !== "GET") {
        const originHeader = context.request.headers.get("Origin");
        const hostHeader = context.request.headers.get("Host");
        if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
            console.log("csrfMiddleware🔥🔥🔥csrfChecks:403:astro🔥🔥🔥");
            console.log(context.request.headers);
            return new Response("csrfChecks:403:astro", {
                status: 403
            });
        }
    }
    return next();
});
