import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import type { Session } from "../../types/SessionType";
import { SESSION_EXPIRES_IN, SESSION_COOKIE_NAME } from "lib/auth-consts";
import { sessionTable } from "../schema";
import type { Context } from "hono";
import { generateSessionToken } from "../../utils/generateSessionToken";
import { setCookie } from "hono/cookie";
import db from "../drizzle";
import { ENFORCE_HOSTNAME_CHECKS } from "../../enforceHostnameChecks";
import type { HonoVariables } from "../../index";
async function createSession(token: string, userId: string, hostname: string, timeInMs: number = SESSION_EXPIRES_IN): Promise<Session> {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const session: Session = {
        id: sessionId,
        userId,
        createdAtTs: Date.now(),
        expiresAt: new Date(Date.now() + timeInMs),
        fresh: false,
        hostname
    };
    await db.insert(sessionTable).values({
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt.getTime(),
        hostname: session.hostname
    });
    return session;
}


export async function createUserSessionAndSetCookie(c: Context<HonoVariables>, userId: string) {
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, userId, c.req.header()['host']!);
    setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
        path: "/",
        secure: ENFORCE_HOSTNAME_CHECKS,
        httpOnly: true,
        expires: session.expiresAt,
        sameSite: "strict"
    });
}