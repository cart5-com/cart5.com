import type { Session } from "@lib/types/SessionType";
import { SESSION_EXPIRES_IN } from "@lib/consts";
import { sessionTable, userTable, verifiedPhoneNumberTable } from "@db/schema/auth.schema";
import db from "@db/drizzle";
import { eq, lte, sql } from "drizzle-orm";
import type { User } from "@lib/types/UserType";


export const deleteSessionService = async (sessionId: string) => {
    await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export const deleteAllUserSessionsService = async (userId: string) => {
    await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
}

export const createSessionService = async (
    sessionId: string,
    userId: string,
    hostname: string,
    timeInMs: number = SESSION_EXPIRES_IN
): Promise<Session> => {
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


export const getSessionAndUserService = async (
    sessionId: string
): Promise<[session: Session | null, user: User | null]> => {
    const [databaseSession, databaseUser] = await Promise.all([
        getSessionService(sessionId),
        getUserFromSessionIdService(sessionId)
    ]);
    if (databaseUser) {
        databaseUser.has2FA = databaseUser.has2FA || false;
    }
    if (databaseUser && databaseSession && databaseSession.createdAtTs) {
        databaseUser.hasNewSession = databaseSession.createdAtTs > Date.now() - 600_000; // 10 minutes
    }
    return [databaseSession, databaseUser];
}


export const getUserFromSessionIdService = async (sessionId: string): Promise<User | null> => {
    const result = await db
        .select({
            id: userTable.id,
            email: userTable.email,
            isEmailVerified: userTable.isEmailVerified,
            name: userTable.name,
            pictureUrl: userTable.pictureUrl,
            has2FA: sql<boolean>`${userTable.encryptedTwoFactorAuthKey} IS NOT NULL`,
            hasVerifiedPhoneNumber: sql<0 | 1>`EXISTS (
                SELECT 1 FROM ${verifiedPhoneNumberTable}
                WHERE ${verifiedPhoneNumberTable.userId} = ${userTable.id}
            )`
        })
        .from(sessionTable)
        .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
        .where(eq(sessionTable.id, sessionId));
    if (result.length !== 1) return null;
    return result[0] as User;
}



export const updateSessionExpirationService = async (sessionId: string, expiresAt: Date): Promise<void> => {
    await db.update(sessionTable).set({ expiresAt: expiresAt.getTime() }).where(eq(sessionTable.id, sessionId));
}


export const getSessionService = async (sessionId: string): Promise<Session | null> => {
    const result = await db
        .select()
        .from(sessionTable)
        .where(eq(sessionTable.id, sessionId));
    if (result.length !== 1) return null;
    if (!result[0]) return null;
    return {
        id: result[0].id,
        userId: result[0].userId,
        hostname: result[0].hostname,
        fresh: false,
        expiresAt: new Date(result[0].expiresAt),
        createdAtTs: result[0].created_at_ts,
    } as Session;
}

export const deleteExpiredSessionsService = async () => {
    return (
        await db
            .delete(sessionTable)
            .where(lte(sessionTable.expiresAt, Date.now()))
    ).rowsAffected;
}

