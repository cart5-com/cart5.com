import { eq } from "drizzle-orm";
import { sessionTable } from "../schema";
import type { Context } from "hono";

export async function deleteSession(c: Context<AuthApiHonoEnv>, sessionId: string): Promise<void> {
    await c.get('DRIZZLE_DB').delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export async function deleteAllUserSessions(c: Context<AuthApiHonoEnv>, userId: string): Promise<void> {
    await c.get('DRIZZLE_DB').delete(sessionTable).where(eq(sessionTable.userId, userId));
}
