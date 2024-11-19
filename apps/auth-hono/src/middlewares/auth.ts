import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
// import { validateSessionToken } from "../lib/session";
import { SESSION_COOKIE_NAME } from "../consts";

export const auth = createMiddleware(async (c, next) => {
    // c.req.header("Cookie") ?? ""
    const token = getCookie(c, SESSION_COOKIE_NAME) ?? null;
    if (token === null) {
        c.set("user", null);
        c.set("session", null);
        return next();
    }
    // const { user, session } = validateSessionToken(token);
    // if (session !== null) {
    //     setSessionTokenCookie(context, token, session.expiresAt);
    // } else {
    //     deleteSessionTokenCookie(context);
    // }
    // context.locals.session = session;
    // context.locals.user = user;
    // const { session, user } = await lucia.validateSession(sessionId);
    // if (session && session.fresh) {
    //     c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), { append: true });
    // }
    // if (!session) {
    //     c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), { append: true });
    // }
    // c.set("session", session);
    // c.set("user", user);
    // return next();
    return next();
});
