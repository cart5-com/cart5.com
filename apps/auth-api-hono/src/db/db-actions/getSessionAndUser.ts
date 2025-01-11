import { eq, sql } from "drizzle-orm";
import type { Session } from "../../types/SessionType";
import type { User } from "../../types/UserType";
import type { Context } from "hono";
import { sessionTable, userTable } from "../schema";

export const getSessionAndUser = async (
    c: Context<AuthApiHonoEnv>,
    sessionId: string
): Promise<[session: Session | null, user: User | null]> => {
    const [databaseSession, databaseUser] = await Promise.all([
        getSession(c, sessionId),
        getUserFromSessionId(c, sessionId)
    ]);
    if (databaseUser) {
        databaseUser.has2FA = databaseUser.has2FA || false;
    }
    if (databaseUser && databaseSession && databaseSession.createdAtTs) {
        databaseUser.hasNewSession = databaseSession.createdAtTs > Date.now() - 600_000; // 10 minutes
    }
    return [databaseSession, databaseUser];
}

const getSession = async (c: Context<AuthApiHonoEnv>, sessionId: string): Promise<Session | null> => {
    const result = await c.get('DRIZZLE_DB')
        .select()
        .from(sessionTable)
        .where(eq(sessionTable.id, sessionId));
    if (result.length !== 1) return null;
    return {
        id: result[0].id,
        userId: result[0].userId,
        hostname: result[0].hostname,
        fresh: false,
        expiresAt: new Date(result[0].expiresAt),
        createdAtTs: result[0].created_at_ts,
    } as Session;
}

const getUserFromSessionId = async (c: Context<AuthApiHonoEnv>, sessionId: string): Promise<User | null> => {
    const result = await c.get('DRIZZLE_DB')
        .select({
            id: userTable.id,
            email: userTable.email,
            isEmailVerified: userTable.isEmailVerified,
            name: userTable.name,
            pictureUrl: userTable.pictureUrl,
            has2FA: sql<boolean>`${userTable.encryptedTwoFactorAuthKey} IS NOT NULL`
        })
        .from(sessionTable)
        .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
        .where(eq(sessionTable.id, sessionId));
    if (result.length !== 1) return null;
    return result[0] as User;
}