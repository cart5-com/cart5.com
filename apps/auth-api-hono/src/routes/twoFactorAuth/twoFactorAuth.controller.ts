import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { encodeBase64, decodeBase64, encodeBase32NoPadding } from "@oslojs/encoding";
import { createTOTPKeyURI, verifyTOTPWithGracePeriod } from "@oslojs/otp";
import { renderSVG } from "uqr";
import { KNOWN_ERROR, type ErrorType } from 'lib/errors';
import { generateRandomRecoveryCode } from '../../utils/generateRandomOtp';
import { decryptAesGcm, decryptToString, encryptAesGcm, encryptString } from '../../utils/encryption';
import { deleteCookie, getCookie } from 'hono/cookie';
import { TWO_FACTOR_AUTH_COOKIE_NAME } from 'lib/auth-consts';
import { decryptAndVerifyJwt } from '../../utils/jwt';
import type { TwoFactorAuthVerifyPayload } from '../../types/UserType';
import { validateTurnstile } from 'lib/utils/validateTurnstile';
import { createUserSessionAndSetCookie } from '../session/session.controller';
import { getEnvVariable } from 'lib/utils/getEnvVariable';
import type { HonoVariables } from "../../index";
import { getUserByEmailService } from '../user/user.service';
import { updateEncryptedTwoFactorAuthKeyService } from '../user/user.service';
import { updateEncryptedTwoFactorAuthRecoveryCodeService } from '../user/user.service';
import type { ValidatorContext } from 'lib/types/hono/ValidatorContext';


export const newTwoFactorAuthRoute = async (c: Context<HonoVariables>) => {
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (!user.hasNewSession) {
        throw new KNOWN_ERROR("A fresh login is required", "FRESH_SESSION_REQUIRED");
    }
    if (user.has2FA) {
        throw new KNOWN_ERROR("User already has 2FA enabled", "USER_ALREADY_HAS_2FA_ENABLED");
    }
    const totpKey = new Uint8Array(20);
    crypto.getRandomValues(totpKey);
    const encodedTOTPKey = encodeBase64(totpKey);
    const keyURI = createTOTPKeyURI(`auth.${getEnvVariable('PUBLIC_DOMAIN_NAME')}`, user.email, totpKey, 30, 6);
    return c.json({
        data: {
            qrCodeSVG: renderSVG(keyURI),
            encodedTOTPKey,
            totpKey: encodeBase32NoPadding(totpKey),
            name: `auth.${getEnvVariable('PUBLIC_DOMAIN_NAME')} - ${user.email}`,
        },
        error: null as ErrorType
    }, 200);
}



export const saveTwoFactorAuthSchemaValidator = zValidator('form', z.object({
    encodedTOTPKey: z.string().length(28, { message: "Invalid TOTP key length" }),
    userProvidedCode: z.string().length(6, { message: "TOTP code must be 6 digits" }),
    turnstile: z.string().min(1, { message: "Verification required" })
}));
export const saveTwoFactorAuthRoute = async (c: Context<HonoVariables, "/two-factor-auth/save", ValidatorContext<typeof saveTwoFactorAuthSchemaValidator>>) => {
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (!user.hasNewSession) {
        throw new KNOWN_ERROR("A fresh login is required", "FRESH_SESSION_REQUIRED");
    }
    if (user.has2FA) {
        throw new KNOWN_ERROR("User already has 2FA enabled", "USER_ALREADY_HAS_2FA_ENABLED");
    }
    const { encodedTOTPKey, userProvidedCode, turnstile } = c.req.valid('form');
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);
    let key: Uint8Array;
    try {
        key = decodeBase64(encodedTOTPKey);
        // Validate key byte length
        if (key.byteLength !== 20) {
            throw new KNOWN_ERROR("Invalid key byte length", "INVALID_KEY");
        }
    } catch {
        throw new KNOWN_ERROR("Invalid TOTP key format", "INVALID_KEY");
    }

    if (!verifyTOTPWithGracePeriod(key, 30, 6, userProvidedCode, 30)) {
        throw new KNOWN_ERROR("Invalid TOTP code", "INVALID_TOTP");
    }

    const encryptedKey = encryptAesGcm(key, getEnvVariable('ENCRYPTION_KEY'));
    await updateEncryptedTwoFactorAuthKeyService(user.id, encryptedKey);
    const recoveryCode = generateRandomRecoveryCode();
    const encryptedRecoveryCode = encryptString(recoveryCode, getEnvVariable('ENCRYPTION_KEY'));
    await updateEncryptedTwoFactorAuthRecoveryCodeService(user.id, encryptedRecoveryCode);

    return c.json({
        data: {
            recoveryCode,
        },
        error: null as ErrorType
    }, 200);
}

export const verifyTwoFactorAuthSchemaValidator = zValidator('form', z.object({
    userProvidedCode: z.string().length(6, { message: "TOTP code must be 6 digits" }),
    turnstile: z.string().min(1, { message: "Verification required" })
}))
export const verifyTwoFactorAuthRoute = async (c: Context<HonoVariables, "/two-factor-auth/verify", ValidatorContext<typeof verifyTwoFactorAuthSchemaValidator>>) => {
    const { userProvidedCode, turnstile } = c.req.valid('form');
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);
    const twoFactorAuthToken = getCookie(c, TWO_FACTOR_AUTH_COOKIE_NAME);

    if (!twoFactorAuthToken) {
        throw new KNOWN_ERROR("Invalid or expired two factor authentication token", "INVALID_TWO_FACTOR_AUTH_TOKEN");
    }

    const { email } = await decryptAndVerifyJwt<TwoFactorAuthVerifyPayload>(
        getEnvVariable('JWT_PRIVATE_KEY'),
        getEnvVariable('ENCRYPTION_KEY'),
        twoFactorAuthToken
    );
    const user = await getUserByEmailService(email);
    if (!user) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (!user.encryptedTwoFactorAuthKey) {
        // no need to throw error here, as it's not expected to happen
        throw new KNOWN_ERROR("UNKNOWN_ERROR", "UNKNOWN_ERROR");
    }
    if (!verifyTOTPWithGracePeriod(decryptAesGcm(user.encryptedTwoFactorAuthKey, getEnvVariable('ENCRYPTION_KEY')), 30, 6, userProvidedCode, 30)) {
        throw new KNOWN_ERROR("Invalid TOTP code", "INVALID_TOTP");
    }

    await createUserSessionAndSetCookie(c, user.id);
    deleteCookie(c, TWO_FACTOR_AUTH_COOKIE_NAME);

    return c.json({
        data: "success",
        error: null as ErrorType
    }, 200);
}


export const removeTwoFactorAuthSchemaValidator = zValidator('form', z.object({
    turnstile: z.string().min(1, { message: "Verification required" }),
    recoveryCode: z.string().min(1, { message: "Recovery code required" }),
}))
export const removeTwoFactorAuthRoute = async (c: Context<HonoVariables, "/two-factor-auth/remove", ValidatorContext<typeof removeTwoFactorAuthSchemaValidator>>) => {
    const { turnstile, recoveryCode } = c.req.valid('form');
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);
    const twoFactorAuthToken = getCookie(c, TWO_FACTOR_AUTH_COOKIE_NAME);

    if (!twoFactorAuthToken) {
        throw new KNOWN_ERROR("Invalid or expired two factor authentication token", "INVALID_TWO_FACTOR_AUTH_TOKEN");
    }

    const { email } = await decryptAndVerifyJwt<TwoFactorAuthVerifyPayload>(
        getEnvVariable('JWT_PRIVATE_KEY'),
        getEnvVariable('ENCRYPTION_KEY'),
        twoFactorAuthToken
    );
    const user = await getUserByEmailService(email);
    if (!user) {
        throw new KNOWN_ERROR("Invalid request 1", "INVALID_REQUEST_1");
    }
    if (!user.encryptedTwoFactorAuthRecoveryCode) {
        throw new KNOWN_ERROR("Invalid request 2", "INVALID_REQUEST_2");
    }
    const decryptedRecoveryCode = decryptToString(user.encryptedTwoFactorAuthRecoveryCode, getEnvVariable('ENCRYPTION_KEY'));
    if (decryptedRecoveryCode !== recoveryCode) {
        throw new KNOWN_ERROR("Invalid request 3", "INVALID_REQUEST_3");
    }

    await updateEncryptedTwoFactorAuthKeyService(user.id, null);
    await updateEncryptedTwoFactorAuthRecoveryCodeService(user.id, null);

    await createUserSessionAndSetCookie(c, user.id);
    deleteCookie(c, TWO_FACTOR_AUTH_COOKIE_NAME);

    return c.json({
        data: "success",
        error: null as ErrorType
    }, 200);
}

export const generateNewRecoveryCodeSchemaValidator = zValidator('form', z.object({
    turnstile: z.string().min(1, { message: "Verification required" }),
}))
export const generateNewRecoveryCodeRoute = async (c: Context<HonoVariables, "/two-factor-auth/generate-new-recovery-code", ValidatorContext<typeof generateNewRecoveryCodeSchemaValidator>>) => {
    const { turnstile } = c.req.valid('form');
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (!user.hasNewSession) {
        throw new KNOWN_ERROR("A fresh login is required", "FRESH_SESSION_REQUIRED");
    }
    // get user by email
    const savedUser = await getUserByEmailService(user.email);
    if (!savedUser) {
        throw new KNOWN_ERROR("User not saved", "USER_NOT_SAVED");
    }

    // user should have a recovery code already
    if (!savedUser.encryptedTwoFactorAuthRecoveryCode) {
        throw new KNOWN_ERROR("User does not have a recovery code", "USER_DOES_NOT_HAVE_RECOVERY_CODE");
    }

    const newRecoveryCode = generateRandomRecoveryCode();
    const encryptedRecoveryCode = encryptString(newRecoveryCode, getEnvVariable('ENCRYPTION_KEY'));
    await updateEncryptedTwoFactorAuthRecoveryCodeService(savedUser.id, encryptedRecoveryCode);

    return c.json({
        data: newRecoveryCode,
        error: null as ErrorType
    }, 200);
}



export const getRecoveryCodeSchemaValidator = zValidator('form', z.object({
    turnstile: z.string().min(1, { message: "Verification required" }),
}))
export const getRecoveryCodeRoute = async (
    c: Context<
        HonoVariables,
        "/two-factor-auth/get-recovery-code",
        ValidatorContext<typeof getRecoveryCodeSchemaValidator>
    >
) => {
    const { turnstile } = c.req.valid('form');
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (!user.hasNewSession) {
        throw new KNOWN_ERROR("A fresh login is required", "FRESH_SESSION_REQUIRED");
    }
    const savedUser = await getUserByEmailService(user.email);
    if (!savedUser) {
        throw new KNOWN_ERROR("Invalid request 1", "INVALID_REQUEST_1");
    }
    if (!savedUser.encryptedTwoFactorAuthRecoveryCode) {
        throw new KNOWN_ERROR("Invalid request 2", "INVALID_REQUEST_2");
    }
    const decryptedRecoveryCode = decryptToString(savedUser.encryptedTwoFactorAuthRecoveryCode, getEnvVariable('ENCRYPTION_KEY'));
    return c.json({
        data: decryptedRecoveryCode,
        error: null as ErrorType
    }, 200);
}

export const remove2FASchemaValidator = zValidator('form', z.object({
    turnstile: z.string().min(1, { message: "Verification required" }),
}))
export const remove2FARoute = async (
    c: Context<
        HonoVariables,
        "/two-factor-auth/remove",
        ValidatorContext<typeof remove2FASchemaValidator>
    >
) => {
    const { turnstile } = c.req.valid('form');
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (!user.hasNewSession) {
        throw new KNOWN_ERROR("A fresh login is required", "FRESH_SESSION_REQUIRED");
    }
    const savedUser = await getUserByEmailService(user.email);
    if (!savedUser) {
        throw new KNOWN_ERROR("Invalid request 1", "INVALID_REQUEST_1");
    }
    await updateEncryptedTwoFactorAuthKeyService(user.id, null);
    await updateEncryptedTwoFactorAuthRecoveryCodeService(user.id, null);
    return c.json({
        data: "success",
        error: null as ErrorType
    }, 200);
}
