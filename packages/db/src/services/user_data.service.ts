import db from "@db/drizzle";
import { userDataTable, userAsAStripeCustomerTable } from "@db/schema/userData.schema";
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


export const getUserAsAStripeCustomer_Service = async (
    userId: string,
    columns?: Partial<Record<keyof typeof userAsAStripeCustomerTable.$inferSelect, boolean>>
) => {
    return await db.query.userAsAStripeCustomerTable.findFirst({
        where: eq(userAsAStripeCustomerTable.userId, userId),
        columns: columns,
    });
}

export const updateUserAsAStripeCustomer_Service = async (
    userId: string,
    stripeCustomerId: string,
    data: Partial<InferInsertModel<typeof userAsAStripeCustomerTable>>
) => {
    const result = await db.insert(userAsAStripeCustomerTable)
        .values({ ...data, userId: userId, stripeCustomerId: stripeCustomerId })
        .onConflictDoUpdate({
            target: [userAsAStripeCustomerTable.userId, userAsAStripeCustomerTable.stripeCustomerId],
            set: data
        });
    return result;
}
