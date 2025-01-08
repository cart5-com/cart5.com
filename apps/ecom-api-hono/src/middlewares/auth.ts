import { createMiddleware } from "hono/factory";
import { createAuthApiClient } from 'lib/apiClients/authApiClient'
import { SESSION_COOKIE_NAME } from "lib/auth-consts";
import type { honoTypes } from "..";
import { getCookie } from "hono/cookie";
import { env } from "hono/adapter";

export const authChecks = createMiddleware<honoTypes>(async (c, next) => {
    const cookieValue = getCookie(c, SESSION_COOKIE_NAME) ?? null;
    // Skip auth check if no session cookie exists
    if (!cookieValue) {
        // if no session cookie, set user to null
        c.set('USER', null);
        await next();
    } else {
        // if session cookie exists, fetch user data
        try {
            const authCookieValue = cookieValue;
            const { INTERNAL_AUTH_API_ORIGIN, INTERNAL_AUTH_API_KEY } = env(c);
            const authApiClient = createAuthApiClient(INTERNAL_AUTH_API_ORIGIN);
            const { data } = await (await authApiClient.api.user.whoami.$post({}, {
                headers: {
                    "internal-auth-api-key": INTERNAL_AUTH_API_KEY,
                    "internal-host": c.req.header()['host'],
                    "authorization": `Bearer ${authCookieValue}`
                }
            })).json();
            c.set('USER', data);
            await next();
        } catch (e) {
            console.log('Auth middleware error:', e);
            c.set('USER', null);
            await next();
        }
    }
});