import { SESSION_COOKIE_NAME } from "@lib/consts";
import { setCookie } from "hono/cookie";
import { ENFORCE_HOSTNAME_CHECKS } from '@lib/utils/enforceHostnameChecks';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { createSessionService } from "@db/services/session.service";
import { generateSessionToken } from "../utils/generateSessionToken";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import type { Context } from "hono";


export const createUserSessionAndSetCookie = async (c: Context<HonoVariables>, userId: string) => {
    const sessionToken = generateSessionToken();
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)));
    const session = await createSessionService(sessionId, userId, c.req.header()['host']!);
    setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
        path: "/",
        secure: ENFORCE_HOSTNAME_CHECKS,
        httpOnly: true,
        expires: session.expiresAt,
        sameSite: "strict"
    });
}