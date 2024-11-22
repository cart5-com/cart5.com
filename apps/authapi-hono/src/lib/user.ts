import { eq } from "drizzle-orm";
import db from "../db/drizzle";
import { user } from "../db/schema";
import { generateKey } from "lib/utils/generateKey";

export async function createUser(googleId: string, email: string, name: string, picture: string): Promise<User> {
    const id = generateKey('u');
    const row = await db.insert(user).values({
        id,
        googleId,
        email,
        name,
        picture
    });
    if (!row) {
        throw new Error("Unexpected error while creating user");
    }
    const userData: User = {
        id,
        googleId,
        email,
        name,
        picture
    };
    return userData;
}

export async function getUserFromGoogleId(googleId: string): Promise<User | null> {
    const row = await db.select({
        id: user.id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.picture
    }).from(user).where(eq(user.googleId, googleId)).get();

    if (!row) {
        return null;
    }
    const userData: User = {
        id: row.id,
        googleId: row.googleId || undefined,
        email: row.email,
        name: row.name,
        picture: row.picture || undefined
    };
    return userData;
}


export interface User {
    id: string;
    email: string;
    googleId?: string;
    name: string;
    picture?: string;
}
