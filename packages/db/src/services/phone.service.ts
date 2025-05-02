import db from "../drizzle";
import { verifiedPhoneNumberTable } from "../schema/auth.schema";
import { eq, and, gte } from "drizzle-orm";

export const addVerifiedPhoneNumber_Service = async (userId: string, phoneNumber: string) => {
    await db.insert(verifiedPhoneNumberTable)
        .values({
            userId,
            phoneNumber
        })
        .onConflictDoNothing();
}

// 180 days
const PHONE_NUMBER_VERIFICATION_EXPIRATION_TIME = 15_552_000_000;
//1000 * 60 * 60 * 24 * 180; 

export const isPhoneNumberVerified_Service = async (phoneNumber: string) => {
    const result = await db.select().from(verifiedPhoneNumberTable)
        .where(and(
            eq(verifiedPhoneNumberTable.phoneNumber, phoneNumber),
            gte(verifiedPhoneNumberTable.created_at_ts, Date.now() - PHONE_NUMBER_VERIFICATION_EXPIRATION_TIME)
        ));
    return result.length > 0;
}

export const getAllVerifiedPhoneNumbers_Service = async (userId: string) => {
    return await db.select().from(verifiedPhoneNumberTable)
        .where(eq(verifiedPhoneNumberTable.userId, userId));
}