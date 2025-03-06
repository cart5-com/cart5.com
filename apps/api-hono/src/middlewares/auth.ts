import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { SESSION_COOKIE_NAME } from "lib/consts/auth-consts";
import { ENFORCE_HOSTNAME_CHECKS } from "lib/auth/enforceHostnameChecks";
import type { HonoVariables } from "lib/hono/HonoVariables";
import { validateSessionCookie } from "lib/auth/validateSessionCookie";

export const authChecks = createMiddleware<HonoVariables>(async (c, next) => {
    const cookieValue = getCookie(c, SESSION_COOKIE_NAME) ?? null;
    if (cookieValue === null) {
        c.set("USER", null);
        c.set("SESSION", null);
        await next();
    } else {
        const { user, session } = await validateSessionCookie(cookieValue, c.req.header()['host']);
        if (session && session.fresh) {
            setCookie(c, SESSION_COOKIE_NAME, cookieValue, {
                path: "/",
                secure: ENFORCE_HOSTNAME_CHECKS,
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