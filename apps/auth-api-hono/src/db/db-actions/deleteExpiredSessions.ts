import { lte } from "drizzle-orm";
import { sessionTable } from "../schema";
import type { Context } from "hono";

// TODO: add a cron job to delete expired sessions
export async function deleteExpiredSessions(c: Context<AuthApiHonoEnv>) {
    return (
        await c.get('DRIZZLE_DB')
            .delete(sessionTable)
            .where(lte(sessionTable.expiresAt, Date.now()))
    ).rowsAffected;
}
