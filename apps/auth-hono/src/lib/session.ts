import { encodeBase32, encodeHexLowerCase } from "@oslojs/encoding";
import type { User } from "./user";
import { sha256 } from "@oslojs/crypto/sha2";
import db from "../db/drizzle";
import { session, user } from "../db/schema";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { SESSION_COOKIE_NAME } from "../consts";
import { IS_PROD } from "lib/utils/getEnvironmentVariable";
import { serializeCookie } from "lib/utils/cookie";

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const row = await db.select({
        id: session.id,
        expiresAt: session.expiresAt,
        userId: session.userId,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.picture
    })
        .from(session)
        .innerJoin(user, eq(session.userId, user.id))
        .where(eq(session.id, sessionId))
        .get();

    if (!row) {
        return { session: null, user: null };
    }
    const sessionData: Session = {
        id: row.id,
        userId: row.userId,
        expiresAt: new Date(row.expiresAt * 1000)
    };
    const userData: User = {
        id: row.userId,
        googleId: row.googleId || undefined,
        email: row.email,
        name: row.name,
        picture: row.picture || undefined
    };
    if (Date.now() >= sessionData.expiresAt.getTime()) {
        await db.delete(session).where(eq(session.id, sessionId));
        return { session: null, user: null };
    }
    if (Date.now() >= sessionData.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
        sessionData.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        await db.update(session).set({
            expiresAt: Math.floor(sessionData.expiresAt.getTime() / 1000)
        }).where(eq(session.id, sessionId));
    }
    return { session: sessionData, user: userData };
}

export async function invalidateSession(sessionId: string): Promise<void> {
    await db.delete(session).where(eq(session.id, sessionId));
}

export async function invalidateUserSessions(userId: string): Promise<void> {
    await db.delete(session).where(eq(session.userId, userId));
}

export function setSessionTokenCookie(c: Context, token: string, expiresAt: Date): void {
    c.header("Set-Cookie", serializeCookie(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        path: "/",
        secure: IS_PROD,
        sameSite: "strict",
        expires: expiresAt
    }), { append: true });
}

export function deleteSessionTokenCookie(c: Context): void {
    c.header("Set-Cookie", serializeCookie(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        path: "/",
        secure: IS_PROD,
        sameSite: "strict",
        expires: new Date(0)
    }), { append: true });
}

export function generateSessionToken(): string {
    const tokenBytes = new Uint8Array(20);
    crypto.getRandomValues(tokenBytes);
    const token = encodeBase32(tokenBytes).toLowerCase();
    return token;
}


export async function createSession(token: string, userId: string): Promise<Session> {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const sessionData: Session = {
        id: sessionId,
        userId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days
    };
    await db.insert(session).values({
        id: sessionId,
        userId,
        expiresAt: Math.floor(sessionData.expiresAt.getTime() / 1000)
    });
    return sessionData;
}

export interface Session {
    id: string;
    expiresAt: Date;
    userId: string;
}

type SessionValidationResult = { session: Session; user: User } | { session: null; user: null };