import { defineMiddleware } from "astro:middleware";
import { createAuthApiClient } from 'lib/apiClients/authApiClient'
import type { APIContext } from "astro";
import { SESSION_COOKIE_NAME } from "lib/auth-consts";

export const authMiddleware = defineMiddleware(async (context, next) => {
    // Skip auth check if no session cookie exists
    if (!context.cookies.get(SESSION_COOKIE_NAME)?.value) {
        // if no session cookie, set user to null
        context.locals.USER = null;
        return next();
    } else {
        // if session cookie exists, fetch user data
        try {
            const { data, whoamiResponse } = await fetchWhoAmI(context);
            context.locals.USER = data;
            const response = await next();
            const setCookieHeaders = whoamiResponse.headers.getSetCookie();
            for (const setCookie of setCookieHeaders) {
                response.headers.append("Set-Cookie", setCookie);
            }
            return response;
        } catch (e) {
            console.log('Auth middleware error:', e);
            context.locals.USER = null;
            return next();
        }
    }
});

async function fetchWhoAmI(context: APIContext) {
    // const authApiClient = createAuthApiClient(`${context.url.origin}/__p_auth/`);

    // use direct connection for auth check,
    // no need to go through network
    const authApiClient = createAuthApiClient(import.meta.env.INTERNAL_AUTH_API_ORIGIN);
    const whoamiUrl = authApiClient.api.user.whoami.$url();
    const authCookieValue = context.cookies.get(SESSION_COOKIE_NAME)?.value;
    // whoamiUrl.protocol = "https";
    // if (import.meta.env.DEV) {
    //     process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    // }
    const whoamiResponse = await fetch(whoamiUrl.toString(), {
        method: "POST",
        headers: {
            "internal-auth-api-key": import.meta.env.INTERNAL_AUTH_API_KEY,
            "internal-host": context.url.host,
            origin: context.url.origin,
            cookie: `${SESSION_COOKIE_NAME}=${authCookieValue}`
        }
    });
    const { data, error } = await whoamiResponse.json();
    return {
        data,
        whoamiResponse,
        error
    };
}