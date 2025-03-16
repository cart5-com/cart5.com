import { sign, verify } from 'hono/jwt'
import { type JWTPayload } from "hono/utils/jwt/types";
import { decrypt, encrypt } from './encryption';
import { KNOWN_ERROR } from '@lib/types/errors';

export const signJWT = (payloadParam: JWTPayload, JWT_PRIVATE_KEY: string, maxAge: number = 600) => {
    if (!payloadParam.hasOwnProperty("exp")) {
        const payload: JWTPayload = {
            ...payloadParam,
            exp: Math.floor(Date.now() / 1000) + maxAge, //  default: expires in 10 minutes
        };
        return sign(payload, JWT_PRIVATE_KEY);
    } else {
        return sign(payloadParam as JWTPayload, JWT_PRIVATE_KEY);
    }
};

export const verifyJWT = <T>(token: string, JWT_PRIVATE_KEY: string): T => {
    return verify(token, JWT_PRIVATE_KEY) as T;
};

export const signJwtAndEncrypt = async <T extends JWTPayload>(
    JWT_PRIVATE_KEY: string,
    ENCRYPTION_KEY: string,
    payloadParam: T,
    maxAge: number = 600,
): Promise<string> => {
    const jwt = await signJWT(payloadParam, JWT_PRIVATE_KEY, maxAge);
    return await encrypt(jwt, ENCRYPTION_KEY);
};

export const decryptAndVerifyJwt = async <T>(
    JWT_PRIVATE_KEY: string,
    ENCRYPTION_KEY: string,
    token: string,
): Promise<T> => {
    try {
        const jwt = await decrypt(token, ENCRYPTION_KEY);
        return await verifyJWT<T>(jwt, JWT_PRIVATE_KEY);
    } catch (error) {
        if (error instanceof Error && error.name === 'JwtTokenExpired') {
            throw new KNOWN_ERROR("EXPIRED", "EXPIRED_TOKEN");
        } else {
            console.error("Error decrypting and verifying JWT:");
            console.error(error);
            throw new KNOWN_ERROR("INVALID TOKEN", "INVALID_TOKEN");
        }
    }
};