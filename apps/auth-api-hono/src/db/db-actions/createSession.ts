import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import type { Session } from "../../types/SessionType";
import { SESSION_EXPIRES_IN } from "../../consts";
import { SESSION_COOKIE_NAME } from "lib/apiClients/authApiClient";
import { sessionTable } from "../schema";
import db from "../drizzle";
import type { Context } from "hono";
import { generateSessionToken } from "../../utils/generateSessionToken";
import { setCookie } from "hono/cookie";
import { IS_PROD } from "../../utils/getEnvironmentVariable";

export async function createSession(token: string, userId: string, hostname: string, timeInMs: number = SESSION_EXPIRES_IN): Promise<Session> {
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


export async function createUserSessionAndSetCookie(c: Context, userId: string) {
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, userId, c.req.header('host')!);
    setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
        path: "/",
        secure: IS_PROD,
        httpOnly: true,
        expires: session.expiresAt,
        sameSite: "strict"
    });
}