import db from "../drizzle";
import { verifiedPhoneNumberTable } from "../schema/auth.schema";

export const addVerifiedPhoneNumberService = async (userId: string, phoneNumber: string) => {
    await db.insert(verifiedPhoneNumberTable)
        .values({
            userId,
            phoneNumber
        })
        .onConflictDoNothing();
}