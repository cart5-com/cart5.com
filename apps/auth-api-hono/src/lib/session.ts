import { encodeBase32, encodeHexLowerCase } from "@oslojs/encoding";
import type { User } from "./user";
import { sha256 } from "@oslojs/crypto/sha2";
import db from "../db/drizzle";
import { session, user } from "../db/schema";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { SESSION_COOKIE_NAME } from "../consts";
import { serializeCookie } from "lib/utils/cookie";

const _15_DAYS_IN_MS = 60e3 * 60 * 24 * 15;
const _30_DAYS_IN_MS = _15_DAYS_IN_MS * 2;
const _10_MINUTES_IN_MS = 60e3 * 10;

export interface Session {
    id: string;
    expiresAt: Date;
    userId: string;
    hostname: string;
}

type SessionValidationResult =
    { session: Session; user: User, isSessionUpdated: boolean } |
    { session: null; user: null, isSessionUpdated: boolean };

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const row = await db.select({
        id: session.id,
        expiresAt: session.expiresAt,
        hostname: session.hostname,
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
        return { session: null, user: null, isSessionUpdated: false };
    }
    const sessionData: Session = {
        id: row.id,
        userId: row.userId,
        expiresAt: new Date(row.expiresAt),
        hostname: row.hostname
    };
    const userData: User = {
        id: row.userId,
        googleId: row.googleId || undefined,
        email: row.email,
        name: row.name,
        picture: row.picture || undefined
    };
    let isSessionUpdated = false;
    if (Date.now() >= sessionData.expiresAt.getTime()) {
        // if session expired, delete it
        await db.delete(session).where(eq(session.id, sessionId));
        return { session: null, user: null, isSessionUpdated: false };
    }
    if (Date.now() >= sessionData.expiresAt.getTime() - _15_DAYS_IN_MS) {
        // if less than 15 days left, refresh for 30 days
        sessionData.expiresAt = new Date(Date.now() + _30_DAYS_IN_MS);
        await db.update(session).set({
            expiresAt: sessionData.expiresAt.getTime()
        }).where(eq(session.id, sessionId));
        isSessionUpdated = true;
    }
    return { session: sessionData, user: userData, isSessionUpdated };
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
        // secure: IS_PROD,
        secure: true, // using https in dev
        sameSite: "lax", // TODO: check if we can use strict, maybe I can use a clientside request with turnstile
        expires: expiresAt
    }), { append: true });
}

export function deleteSessionTokenCookie(c: Context): void {
    c.header("Set-Cookie", serializeCookie(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        path: "/",
        // secure: IS_PROD,
        secure: true, // using https in dev
        sameSite: "lax", // TODO: check if we can use strict, maybe I can use a clientside request with turnstile
        maxAge: 0,
    }), { append: true });
}

export function generateSessionCookieValue(): string {
    const tokenBytes = new Uint8Array(20);
    crypto.getRandomValues(tokenBytes);
    const token = encodeBase32(tokenBytes).toLowerCase();
    return token;
}

export async function createLongLivedSession(userId: string, hostname: string): Promise<{
    session: Session;
    cookieValue: string;
}> {
    const expiresAt = new Date(Date.now() + _30_DAYS_IN_MS);
    const cookieValue = generateSessionCookieValue();
    const session = await createSession(cookieValue, userId, expiresAt, hostname);
    return { session, cookieValue };
}

export async function createShortLivedSession(userId: string, hostname: string): Promise<{
    session: Session;
    cookieValue: string;
}> {
    const expiresAt = new Date(Date.now() + _10_MINUTES_IN_MS);
    const cookieValue = generateSessionCookieValue();
    const session = await createSession(cookieValue, userId, expiresAt, hostname);
    return { session, cookieValue };
}

export async function createSession(token: string, userId: string, expiresAt: Date, hostname: string): Promise<Session> {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const sessionData: Session = {
        id: sessionId,
        userId,
        expiresAt,
        hostname
    };
    await db.insert(session).values({
        id: sessionId,
        userId,
        expiresAt: sessionData.expiresAt.getTime(),
        hostname
    });
    return sessionData;
}

