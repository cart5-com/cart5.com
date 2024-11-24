import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { SESSION_COOKIE_NAME } from "../consts";
import { deleteSessionTokenCookie, invalidateSessionByCookieValue, setSessionTokenCookie, validateSessionToken } from "../lib/session";

export const authChecks = createMiddleware(async (c, next) => {
    // c.req.header("Cookie") ?? ""
    const cookieValue = getCookie(c, SESSION_COOKIE_NAME) ?? null;
    if (cookieValue === null) {
        c.set("USER", null);
        c.set("SESSION", null);
        return next();
    } else {
        const hostname = c.req.header('Host');
        const { user, session, isSessionUpdated } = await validateSessionToken(cookieValue, hostname!);
        if (session === null) {
            await invalidateSessionByCookieValue(cookieValue);
            deleteSessionTokenCookie(c);
            c.set("USER", null);
            c.set("SESSION", null);
            return next();
        } else {
            // session is valid
            if (isSessionUpdated) {
                setSessionTokenCookie(c, cookieValue, session.expiresAt);
            }
            c.set("USER", user);
            c.set("SESSION", session);
            await next();
        }

    }
});


// function readBearerToken(authorizationHeader: string): string | null {
//     const [authScheme, token] = authorizationHeader.split(" ") as [string, string | undefined];
//     if (authScheme !== "Bearer") {
//         return null;
//     }
//     return token ?? null;
// }


// // If required we can get the user info from SSR
// if (import.meta.env.DEV) {
// 	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// }
// const host = Astro.request.headers.get("host");
// const protocol = Astro.request.headers.get("x-forwarded-proto") ?? "http";
// const authRequest = new Request(`${protocol}://${host}/__p_auth/api/user/whoami`, {
// 	headers: Astro.request.headers
// });

// const response = await fetch(authRequest);
// const sessionCookie = response.headers.get("set-cookie");
// if (sessionCookie) {
// 	Astro.response.headers.set("Set-Cookie", sessionCookie);
// }
// const { data: serverSideUser } = await response.json();
// console.log(serverSideUser);