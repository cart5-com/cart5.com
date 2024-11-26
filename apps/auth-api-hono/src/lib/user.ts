import { eq } from "drizzle-orm";
import db from "../db/drizzle";
import { user } from "../db/schema";
import { generateKey } from "lib/utils/generateKey";
import { decodeIdToken, OAuth2Tokens } from "arctic";
import { getGoogleOAuthHelper } from "./googleOAuthHelper";
import { KNOWN_ERROR } from "lib/errors";


export interface User {
    id: string;
    email: string;
    name: string;
    passwordHash?: string;
    googleId?: string;
    picture?: string;
}

export async function createSignupUser(email: string, passwordHash: string, name: string): Promise<User> {
    // insert user into db if email is exist throw error
    const id = generateKey('u');
    const row = await db.insert(user).values({
        id,
        email,
        name,
        passwordHash,
    });
    if (!row) {
        throw new Error("Unexpected error while creating user");
    }
    const userData: User = {
        id,
        email,
        name,
    };
    return userData;
}

export async function getSignupUser(email: string): Promise<User | null> {
    const row = await db.select().from(user).where(eq(user.email, email)).get();
    if (!row) {
        return null;
    }
    const userData: User = {
        id: row.id,
        email: row.email,
        name: row.name,
        passwordHash: row.passwordHash || undefined,
    };
    return userData;
}

export async function handleGoogleCallbackUser(code: string, codeVerifier: string): Promise<User> {
    let tokens: OAuth2Tokens;
    try {
        const googleOAuthHelper = getGoogleOAuthHelper();
        tokens = await googleOAuthHelper.validateAuthorizationCode(code, codeVerifier);
    } catch (e) {
        throw new KNOWN_ERROR("EXPIRED", "EXPIRED_4");
    }
    const claims = decodeIdToken(tokens.idToken()) as { sub: string, name: string, picture: string, email: string };
    const googleId = claims.sub;
    const name = claims.name;
    const picture = claims.picture;
    const email = claims.email;

    const user = await upsertGoogleOAuthUser(googleId, email, name, picture);
    return user;
}

export async function upsertGoogleOAuthUser(googleId: string, email: string, name: string, picture: string): Promise<User> {
    const existingUser = await getGoogleOAuthUserByEmail(email);
    if (existingUser !== null) {
        return existingUser;
    }
    return createGoogleOAuthUser(googleId, email, name, picture);
}


export async function createGoogleOAuthUser(googleId: string, email: string, name: string, picture: string): Promise<User> {
    const id = generateKey('u');
    const row = await db.insert(user).values({
        id,
        googleId,
        email,
        name,
        picture,
        passwordHash: null
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

export async function getGoogleOAuthUserByEmail(email: string): Promise<User | null> {
    const row = await db.select({
        id: user.id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.picture
    }).from(user).where(eq(user.email, email)).get();

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

