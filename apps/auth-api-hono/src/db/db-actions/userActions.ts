import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { userTable } from "../schema";
import { generateKey } from "lib/utils/generateKey";

export async function upsertUser(c: Context<AuthApiHonoEnv>, email: string, passwordHash: string | null = null) {
    let existingUser = await getUserByEmail(c, email);
    if (!existingUser) {
        const id = generateKey('u');
        const newUser = await c.get('DRIZZLE_DB').insert(userTable)
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

export async function updateUserPassword(c: Context<AuthApiHonoEnv>, userId: string, passwordHash: string) {
    await c.get('DRIZZLE_DB').update(userTable).set({ passwordHash }).where(eq(userTable.id, userId));
}

export async function updateEncryptedTwoFactorAuthKey(c: Context<AuthApiHonoEnv>, userId: string, encryptedKey: Uint8Array | null) {
    await c.get('DRIZZLE_DB').update(userTable).set({ encryptedTwoFactorAuthKey: encryptedKey }).where(eq(userTable.id, userId));
}

export async function getEncryptedTwoFactorAuthKey(c: Context<AuthApiHonoEnv>, userId: string) {
    const user = await c.get('DRIZZLE_DB').select({
        encryptedTwoFactorAuthKey: userTable.encryptedTwoFactorAuthKey
    }).from(userTable).where(eq(userTable.id, userId));
    return user[0]?.encryptedTwoFactorAuthKey;
}

export async function updateEncryptedTwoFactorAuthRecoveryCode(c: Context<AuthApiHonoEnv>, userId: string, encryptedCode: Uint8Array | null) {
    await c.get('DRIZZLE_DB').update(userTable).set({ encryptedTwoFactorAuthRecoveryCode: encryptedCode }).where(eq(userTable.id, userId));
}

export async function getTwoFactorAuthRecoveryCode(c: Context<AuthApiHonoEnv>, userId: string) {
    const user = await c.get('DRIZZLE_DB').select({
        encryptedTwoFactorAuthRecoveryCode: userTable.encryptedTwoFactorAuthRecoveryCode
    }).from(userTable).where(eq(userTable.id, userId));
    return user[0]?.encryptedTwoFactorAuthRecoveryCode;
}

export async function isEmailExists(c: Context<AuthApiHonoEnv>, email: string) {
    return (await c.get('DRIZZLE_DB').select().from(userTable).where(eq(userTable.email, email))).length > 0;
}

export async function markEmailAsVerified(c: Context<AuthApiHonoEnv>, email: string) {
    await c.get('DRIZZLE_DB').update(userTable).set({ isEmailVerified: true }).where(eq(userTable.email, email));
}

export async function updateUserName(c: Context<AuthApiHonoEnv>, userId: string, name: string) {
    await c.get('DRIZZLE_DB').update(userTable).set({ name }).where(eq(userTable.id, userId));
}

export async function getUserByEmail(c: Context<AuthApiHonoEnv>, email: string) {
    return (await c.get('DRIZZLE_DB').select().from(userTable).where(eq(userTable.email, email)))[0];
}

export async function updateUserPictureUrl(c: Context<AuthApiHonoEnv>, userId: string, pictureUrl: string) {
    await c.get('DRIZZLE_DB').update(userTable).set({ pictureUrl }).where(eq(userTable.id, userId));
}
