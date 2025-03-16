import { generateKey } from "@lib/utils/generateKey";
import db from "../drizzle";
import { userTable } from "../schema/auth.schema";
import { eq } from "drizzle-orm";

export const updateUserPasswordService = async (userId: string, passwordHash: string) => {
    await db.update(userTable).set({ passwordHash }).where(eq(userTable.id, userId));
}

export const updateUserNameService = async (userId: string, name: string) => {
    await db.update(userTable).set({ name }).where(eq(userTable.id, userId));
}

export const markEmailAsVerifiedService = async (email: string) => {
    await db.update(userTable).set({ isEmailVerified: true }).where(eq(userTable.email, email));
}

export const upsertUserService = async (email: string, passwordHash: string | null = null) => {
    let existingUser = await getUserByEmailService(email);
    if (!existingUser) {
        const id = generateKey('u');
        const newUser = await db.insert(userTable)
            .values({
                id,
                email,
                isEmailVerified: false,
                name: null,
                passwordHash,
                pictureUrl: null,
                encryptedTwoFactorAuthKey: null,
                encryptedTwoFactorAuthRecoveryCode: null,
            }).returning();
        existingUser = newUser[0];
    }
    return existingUser;
}

export const getUserByEmailService = async (email: string) => {
    return (await db.select().from(userTable).where(eq(userTable.email, email)))[0];
}

export const updateEncryptedTwoFactorAuthKeyService = async (userId: string, encryptedKey: Uint8Array | null) => {
    await db.update(userTable).set({ encryptedTwoFactorAuthKey: encryptedKey }).where(eq(userTable.id, userId));
}

export const getEncryptedTwoFactorAuthKeyService = async (userId: string) => {
    const user = await db.select({
        encryptedTwoFactorAuthKey: userTable.encryptedTwoFactorAuthKey
    }).from(userTable).where(eq(userTable.id, userId));
    return user[0]?.encryptedTwoFactorAuthKey;
}

export const updateEncryptedTwoFactorAuthRecoveryCodeService = async (userId: string, encryptedCode: Uint8Array | null) => {
    await db.update(userTable).set({ encryptedTwoFactorAuthRecoveryCode: encryptedCode }).where(eq(userTable.id, userId));
}

export const getTwoFactorAuthRecoveryCodeService = async (userId: string) => {
    const user = await db.select({
        encryptedTwoFactorAuthRecoveryCode: userTable.encryptedTwoFactorAuthRecoveryCode
    }).from(userTable).where(eq(userTable.id, userId));
    return user[0]?.encryptedTwoFactorAuthRecoveryCode;
}

export const isEmailExistsService = async (email: string) => {
    return (await db.select().from(userTable).where(eq(userTable.email, email))).length > 0;
}

export const updateUserPictureUrlService = async (userId: string, pictureUrl: string) => {
    await db.update(userTable).set({ pictureUrl }).where(eq(userTable.id, userId));
}

