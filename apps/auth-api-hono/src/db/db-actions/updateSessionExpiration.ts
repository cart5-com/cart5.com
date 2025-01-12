import { sessionTable } from "../schema";
import { eq } from "drizzle-orm";
import db from "../drizzle";

export default async function updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
    await db.update(sessionTable).set({ expiresAt: expiresAt.getTime() }).where(eq(sessionTable.id, sessionId));
}