import { defineMiddleware } from "astro:middleware";
import { getEnvironmentVariable } from "lib/utils/getEnvironmentVariable";
import { createAuthApiClient, SESSION_COOKIE_NAME } from 'lib/apiClients/authApiClient'
import type { APIContext } from "astro";

export const authMiddleware = defineMiddleware(async (context, next) => {
    // Skip auth check if no session cookie exists
    if (!context.cookies.get(SESSION_COOKIE_NAME)?.value) {
        context.locals.USER = null;
        return next();
    }

    if (context.cookies.get(SESSION_COOKIE_NAME)?.value) {
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
    return next();
});

async function fetchWhoAmI(context: APIContext) {
    // const authApiClient = createAuthApiClient(`${context.url.origin}/__p_auth/`);

    // use direct connection for auth check,
    // no need to go through network
    console.log('AUTH_API_ORIGIN:', getEnvironmentVariable("AUTH_API_ORIGIN"));
    const authApiClient = createAuthApiClient(getEnvironmentVariable("AUTH_API_ORIGIN"));
    const whoamiUrl = authApiClient.api.user.whoami.$url();
    const authCookieValue = context.cookies.get(SESSION_COOKIE_NAME)?.value;
    // whoamiUrl.protocol = "https";
    // if (import.meta.env.DEV) {
    //     process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    // }
    const whoamiResponse = await fetch(whoamiUrl.toString(), {
        method: "POST",
        headers: {
            internalHost: context.url.host,
            internalSecret: getEnvironmentVariable("JWT_SECRET"),
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