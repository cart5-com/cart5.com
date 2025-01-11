import type { Context } from "hono";
import { sessionTable } from "../schema";
import { eq } from "drizzle-orm";

export default async function updateSessionExpiration(c: Context<AuthApiHonoEnv>, sessionId: string, expiresAt: Date): Promise<void> {
    await c.get('DRIZZLE_DB').update(sessionTable).set({ expiresAt: expiresAt.getTime() }).where(eq(sessionTable.id, sessionId));
}
