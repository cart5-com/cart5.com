import { lte } from "drizzle-orm";
import { sessionTable } from "../../db/schema";
import db from "../../db/drizzle";

// TODO: add a cron job to delete expired sessions
export const deleteExpiredSessionsService = async () => {
    return (
        await db
            .delete(sessionTable)
            .where(lte(sessionTable.expiresAt, Date.now()))
    ).rowsAffected;
}
