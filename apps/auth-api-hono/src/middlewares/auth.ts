import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { SESSION_COOKIE_NAME } from "lib/auth-consts";
import { ENFORCE_HOSTNAME_CHECKS } from "../enforceHostnameChecks";
import { getEnvVariable } from "lib/utils/getEnvVariable";
import type { HonoVariables } from "../index";
import { validateSessionCookie } from "../db/validateSessionCookie";

export const authChecks = createMiddleware<HonoVariables>(async (c, next) => {
    const cookieValue = getCookie(c, SESSION_COOKIE_NAME) ?? null;
    if (cookieValue === null) {
        c.set("USER", null);
        c.set("SESSION", null);
        await next();
    } else {
        let hostname = c.req.header()['host'];
        const internalAuthApiKey = c.req.header()['internal-auth-api-key'] ?? null;
        if (internalAuthApiKey === getEnvVariable('INTERNAL_AUTH_API_KEY')) {
            // allow internal requests to bypass hostname checks
            hostname = c.req.header()['internal-host'];
        }
        const { user, session } = await validateSessionCookie(cookieValue, hostname!);
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