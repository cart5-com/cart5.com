import { lte } from "drizzle-orm";
import { sessionTable } from "../schema";
import type { Context } from "hono";
import type { honoTypes } from "../../index";

// TODO: add a cron job to delete expired sessions
export async function deleteExpiredSessions(c: Context<honoTypes>) {
    return (
        await c.get('DRIZZLE_DB')
            .delete(sessionTable)
            .where(lte(sessionTable.expiresAt, Date.now()))
    ).rowsAffected;
}
