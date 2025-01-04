import { eq } from "drizzle-orm";
import type { honoTypes } from "../../index";
import type { Context } from "hono";
import getDrizzleDb from "../drizzle";
import { userTable } from "../schema";
import { generateKey } from "../../utils/generateKey";

export async function upsertUser(c: Context<honoTypes>, email: string, passwordHash: string | null = null) {
    let existingUser = await getUserByEmail(c, email);
    if (!existingUser) {
        const id = generateKey('u');
        const newUser = await getDrizzleDb(c).insert(userTable)
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

export async function updateUserPassword(c: Context<honoTypes>, userId: string, passwordHash: string) {
    await getDrizzleDb(c).update(userTable).set({ passwordHash }).where(eq(userTable.id, userId));
}

export async function updateEncryptedTwoFactorAuthKey(c: Context<honoTypes>, userId: string, encryptedKey: Uint8Array | null) {
    await getDrizzleDb(c).update(userTable).set({ encryptedTwoFactorAuthKey: encryptedKey }).where(eq(userTable.id, userId));
}

export async function getEncryptedTwoFactorAuthKey(c: Context<honoTypes>, userId: string) {
    const user = await getDrizzleDb(c).select({
        encryptedTwoFactorAuthKey: userTable.encryptedTwoFactorAuthKey
    }).from(userTable).where(eq(userTable.id, userId));
    return user[0]?.encryptedTwoFactorAuthKey;
}

export async function updateEncryptedTwoFactorAuthRecoveryCode(c: Context<honoTypes>, userId: string, encryptedCode: Uint8Array | null) {
    await getDrizzleDb(c).update(userTable).set({ encryptedTwoFactorAuthRecoveryCode: encryptedCode }).where(eq(userTable.id, userId));
}

export async function getTwoFactorAuthRecoveryCode(c: Context<honoTypes>, userId: string) {
    const user = await getDrizzleDb(c).select({
        encryptedTwoFactorAuthRecoveryCode: userTable.encryptedTwoFactorAuthRecoveryCode
    }).from(userTable).where(eq(userTable.id, userId));
    return user[0]?.encryptedTwoFactorAuthRecoveryCode;
}

export async function isEmailExists(c: Context<honoTypes>, email: string) {
    return (await getDrizzleDb(c).select().from(userTable).where(eq(userTable.email, email))).length > 0;
}

export async function markEmailAsVerified(c: Context<honoTypes>, email: string) {
    await getDrizzleDb(c).update(userTable).set({ isEmailVerified: true }).where(eq(userTable.email, email));
}

export async function updateUserName(c: Context<honoTypes>, userId: string, name: string) {
    await getDrizzleDb(c).update(userTable).set({ name }).where(eq(userTable.id, userId));
}

export async function getUserByEmail(c: Context<honoTypes>, email: string) {
    return (await getDrizzleDb(c).select().from(userTable).where(eq(userTable.email, email)))[0];
}

export async function updateUserPictureUrl(c: Context<honoTypes>, userId: string, pictureUrl: string) {
    await getDrizzleDb(c).update(userTable).set({ pictureUrl }).where(eq(userTable.id, userId));
}
