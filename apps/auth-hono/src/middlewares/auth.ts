import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { SESSION_COOKIE_NAME } from "../consts";
import { deleteSessionTokenCookie, setSessionTokenCookie, validateSessionToken } from "../lib/session";

export const auth = createMiddleware(async (c, next) => {
    // c.req.header("Cookie") ?? ""
    const token = getCookie(c, SESSION_COOKIE_NAME) ?? null;
    if (token === null) {
        c.set("USER", null);
        c.set("SESSION", null);
        return next();
    } else {
        const { user, session, isSessionUpdated } = await validateSessionToken(token);
        if (session !== null) {
            if (isSessionUpdated) {
                setSessionTokenCookie(c, token, session.expiresAt);
            }
        } else {
            deleteSessionTokenCookie(c);
        }
        c.set("USER", user);
        c.set("SESSION", session);
        await next();
    }
});
