import getDrizzleDb from "../drizzle";
import type { honoTypes } from "../../index";
import type { Context } from "hono";
import { sessionTable } from "../schema";
import { eq } from "drizzle-orm";

export default async function updateSessionExpiration(c: Context<honoTypes>, sessionId: string, expiresAt: Date): Promise<void> {
    await getDrizzleDb(c).update(sessionTable).set({ expiresAt: expiresAt.getTime() }).where(eq(sessionTable.id, sessionId));
}
