import { lte } from "drizzle-orm";
import { sessionTable } from "../schema";
import db from "../drizzle";

// TODO: add a cron job to delete expired sessions
export async function deleteExpiredSessions() {
    return (
        await db
            .delete(sessionTable)
            .where(lte(sessionTable.expiresAt, Date.now()))
    ).rowsAffected;
}
