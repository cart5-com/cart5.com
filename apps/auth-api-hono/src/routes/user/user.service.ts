import db from "../../db/drizzle";
import { sessionTable, userTable } from "../../db/schema";
import { eq } from "drizzle-orm";

export const deleteSessionService = async (sessionId: string) => {
    await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export const deleteAllUserSessionsService = async (userId: string) => {
    await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
}

export const updateUserPasswordService = async (userId: string, passwordHash: string) => {
    await db.update(userTable).set({ passwordHash }).where(eq(userTable.id, userId));
}

export const updateUserNameService = async (userId: string, name: string) => {
    await db.update(userTable).set({ name }).where(eq(userTable.id, userId));
}
