import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { SESSION_COOKIE_NAME } from "lib/auth-consts";
import { validateSessionCookie } from "../db/db-actions/validateSessionCookie";
import type { honoTypes } from "..";
import { env } from "hono/adapter";
export const authChecks = createMiddleware<honoTypes>(async (c, next) => {
    const cookieValue = getCookie(c, SESSION_COOKIE_NAME) ?? null;
    if (cookieValue === null) {
        c.set("USER", null);
        c.set("SESSION", null);
        await next();
    } else {
        let hostname = c.req.header()['host'];
        const internalAuthApiKey = c.req.header()['internal-auth-api-key'] ?? null;
        if (internalAuthApiKey === env(c).INTERNAL_AUTH_API_KEY) {
            // allow internal requests to bypass hostname checks
            hostname = c.req.header()['internal-host'];
        }
        const { user, session } = await validateSessionCookie(c, cookieValue, hostname!);
        if (session && session.fresh) {
            setCookie(c, SESSION_COOKIE_NAME, cookieValue, {
                path: "/",
                secure: c.get('IS_PROD'),
                httpOnly: true,
                expires: session.expiresAt,
                sameSite: "strict"
            });
        }
        if (!session) {
            deleteCookie(c, SESSION_COOKIE_NAME);
        }
        c.set("SESSION", session);
        c.set("USER", user);
        await next();
    }
});