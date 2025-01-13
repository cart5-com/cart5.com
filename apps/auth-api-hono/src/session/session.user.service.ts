import { eq, sql } from "drizzle-orm";
import type { Session } from "../types/SessionType";
import type { User } from "../types/UserType";
import { sessionTable, userTable } from "../db/schema";
import db from "../db/drizzle";
import { getSessionService } from "./session.service";

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
            has2FA: sql<boolean>`${userTable.encryptedTwoFactorAuthKey} IS NOT NULL`
        })
        .from(sessionTable)
        .innerJoin(userTable, eq(sessionTable.userId, userTable.id))
        .where(eq(sessionTable.id, sessionId));
    if (result.length !== 1) return null;
    return result[0] as User;
}