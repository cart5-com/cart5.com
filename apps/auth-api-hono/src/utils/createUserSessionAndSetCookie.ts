import { SESSION_COOKIE_NAME } from "lib/auth-consts";
import { setCookie } from "hono/cookie";
import { ENFORCE_HOSTNAME_CHECKS } from "../enforceHostnameChecks";
import type { HonoVariables } from "../index";
import { createSessionService } from "../db/db.session.service";
import { generateSessionToken } from "../utils/generateSessionToken";
import type { Context } from "hono";

export const createUserSessionAndSetCookie = async (c: Context<HonoVariables>, userId: string) => {
    const sessionToken = generateSessionToken();
    const session = await createSessionService(sessionToken, userId, c.req.header()['host']!);
    setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
        path: "/",
        secure: ENFORCE_HOSTNAME_CHECKS,
        httpOnly: true,
        expires: session.expiresAt,
        sameSite: "strict"
    });
}