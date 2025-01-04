import { lte } from "drizzle-orm";
import { sessionTable } from "../schema";
import getDrizzleDb from "../drizzle";
import type { Context } from "hono";
import type { honoTypes } from "../../index";

export async function deleteExpiredSessions(c: Context<honoTypes>) {
    return (
        await getDrizzleDb(c)
            .delete(sessionTable)
            .where(lte(sessionTable.expiresAt, Date.now()))
    ).rowsAffected;
}
