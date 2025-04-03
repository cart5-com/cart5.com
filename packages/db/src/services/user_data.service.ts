import db from "@db/drizzle";
import { userDataTable } from "@db/schema/userData.schema";
import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

export const getUserData_Service = async (
    userId: string,
    columns?: Partial<Record<keyof typeof userDataTable.$inferSelect, boolean>>
) => {
    return await db.query.userDataTable.findFirst({
        where: eq(userDataTable.userId, userId),
        columns: columns,
    });
}

export const updateUserData_Service = async (
    userId: string,
    data: Partial<InferInsertModel<typeof userDataTable>>
) => {
    return await db.insert(userDataTable)
        .values({ ...data, userId: userId })
        .onConflictDoUpdate({
            target: userDataTable.userId,
            set: data
        });
}
