import { eq } from "drizzle-orm";
import { sessionTable } from "../schema";
import type { honoTypes } from "../../index";
import type { Context } from "hono";

export async function deleteSession(c: Context<honoTypes>, sessionId: string): Promise<void> {
    await c.get('DRIZZLE_DB').delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export async function deleteAllUserSessions(c: Context<honoTypes>, userId: string): Promise<void> {
    await c.get('DRIZZLE_DB').delete(sessionTable).where(eq(sessionTable.userId, userId));
}
