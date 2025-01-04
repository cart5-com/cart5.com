import { Hono } from 'hono'
import type { honoTypes } from '../index'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { encodeBase64, decodeBase64, encodeBase32NoPadding } from "@oslojs/encoding";
import { createTOTPKeyURI, verifyTOTPWithGracePeriod } from "@oslojs/otp";
import { renderSVG } from "uqr";
import { KNOWN_ERROR, type ErrorType } from '../errors';
import { getUserByEmail, updateEncryptedTwoFactorAuthKey, updateEncryptedTwoFactorAuthRecoveryCode } from '../db/db-actions/userActions';
import { generateRandomRecoveryCode } from '../utils/generateRandomOtp';
import { decryptAesGcm, decryptToString, encryptAesGcm, encryptString } from '../utils/encryption';
import { deleteCookie, getCookie } from 'hono/cookie';
import { TWO_FACTOR_AUTH_COOKIE_NAME } from '../consts';
import { decryptAndVerifyJwt } from '../utils/jwt';
import type { TwoFactorAuthVerifyPayload } from '../types/UserType';
import { validateTurnstile } from '../utils/validateTurnstile';
import { createUserSessionAndSetCookie } from '../db/db-actions/createSession';
import { env } from 'hono/adapter';

export const twoFactorAuthRoute = new Hono<honoTypes>()
    .use(async (c, next) => {
        const origin = c.req.header('origin');
        if (origin !== `https://auth.${env(c).PUBLIC_DOMAIN_NAME}`) {
            throw new KNOWN_ERROR("Invalid origin", "INVALID_ORIGIN");
        }
        await next();
    })
    .post(
        '/new',
        async (c) => {
            const user = c.get("USER");
            const { PUBLIC_DOMAIN_NAME } = env(c);
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
            const keyURI = createTOTPKeyURI(`auth.${PUBLIC_DOMAIN_NAME}`, user.email, totpKey, 30, 6);
            return c.json({
                data: {
                    qrCodeSVG: renderSVG(keyURI),
                    encodedTOTPKey,
                    totpKey: encodeBase32NoPadding(totpKey),
                    name: `auth.${PUBLIC_DOMAIN_NAME} - ${user.email}`,
                },
                error: null as ErrorType
            }, 200);
        }
    )
    .post(
        '/save',
        zValidator('form', z.object({
            encodedTOTPKey: z.string().length(28, { message: "Invalid TOTP key length" }),
            userProvidedCode: z.string().length(6, { message: "TOTP code must be 6 digits" }),
            turnstile: z.string().min(1, { message: "Verification required" })
        })),
        async (c) => {
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
            const {
                TURNSTILE_SECRET,
                ENCRYPTION_KEY
            } = env(c);
            await validateTurnstile(TURNSTILE_SECRET, turnstile, c.req.header('X-Forwarded-For'));
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

            const encryptedKey = encryptAesGcm(key, ENCRYPTION_KEY);
            await updateEncryptedTwoFactorAuthKey(c, user.id, encryptedKey);
            const recoveryCode = generateRandomRecoveryCode();
            const encryptedRecoveryCode = encryptString(recoveryCode, ENCRYPTION_KEY);
            await updateEncryptedTwoFactorAuthRecoveryCode(c, user.id, encryptedRecoveryCode);

            return c.json({
                data: {
                    recoveryCode,
                },
                error: null as ErrorType
            }, 200);
        }
    )
    .post(
        '/verify',
        zValidator('form', z.object({
            userProvidedCode: z.string().length(6, { message: "TOTP code must be 6 digits" }),
            turnstile: z.string().min(1, { message: "Verification required" })
        })),
        async (c) => {
            const { userProvidedCode, turnstile } = c.req.valid('form');
            const {
                TURNSTILE_SECRET,
                JWT_PRIVATE_KEY,
                ENCRYPTION_KEY
            } = env(c);
            await validateTurnstile(TURNSTILE_SECRET, turnstile, c.req.header('X-Forwarded-For'));
            const twoFactorAuthToken = getCookie(c, TWO_FACTOR_AUTH_COOKIE_NAME);

            if (!twoFactorAuthToken) {
                throw new KNOWN_ERROR("Invalid or expired two factor authentication token", "INVALID_TWO_FACTOR_AUTH_TOKEN");
            }

            const { email } = await decryptAndVerifyJwt<TwoFactorAuthVerifyPayload>(
                JWT_PRIVATE_KEY,
                ENCRYPTION_KEY,
                twoFactorAuthToken
            );
            const user = await getUserByEmail(c, email);
            if (!user) {
                throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
            }
            if (!user.encryptedTwoFactorAuthKey) {
                // no need to throw error here, as it's not expected to happen
                throw new KNOWN_ERROR("UNKNOWN_ERROR", "UNKNOWN_ERROR");
            }
            if (!verifyTOTPWithGracePeriod(decryptAesGcm(user.encryptedTwoFactorAuthKey, ENCRYPTION_KEY), 30, 6, userProvidedCode, 30)) {
                throw new KNOWN_ERROR("Invalid TOTP code", "INVALID_TOTP");
            }

            await createUserSessionAndSetCookie(c, user.id);
            deleteCookie(c, TWO_FACTOR_AUTH_COOKIE_NAME);

            return c.json({
                data: "success",
                error: null as ErrorType
            }, 200);

        }
    )
    .post(
        '/remove-2fa-with-recovery-code',
        zValidator('form', z.object({
            turnstile: z.string().min(1, { message: "Verification required" }),
            recoveryCode: z.string().min(1, { message: "Recovery code required" }),
        })),
        async (c) => {
            const { turnstile, recoveryCode } = c.req.valid('form');
            const {
                TURNSTILE_SECRET,
                JWT_PRIVATE_KEY,
                ENCRYPTION_KEY
            } = env(c);
            await validateTurnstile(TURNSTILE_SECRET, turnstile, c.req.header('X-Forwarded-For'));
            const twoFactorAuthToken = getCookie(c, TWO_FACTOR_AUTH_COOKIE_NAME);

            if (!twoFactorAuthToken) {
                throw new KNOWN_ERROR("Invalid or expired two factor authentication token", "INVALID_TWO_FACTOR_AUTH_TOKEN");
            }

            const { email } = await decryptAndVerifyJwt<TwoFactorAuthVerifyPayload>(
                JWT_PRIVATE_KEY,
                ENCRYPTION_KEY,
                twoFactorAuthToken
            );
            const user = await getUserByEmail(c, email);
            if (!user) {
                throw new KNOWN_ERROR("Invalid request 1", "INVALID_REQUEST_1");
            }
            if (!user.encryptedTwoFactorAuthRecoveryCode) {
                throw new KNOWN_ERROR("Invalid request 2", "INVALID_REQUEST_2");
            }
            const decryptedRecoveryCode = decryptToString(user.encryptedTwoFactorAuthRecoveryCode, ENCRYPTION_KEY);
            if (decryptedRecoveryCode !== recoveryCode) {
                throw new KNOWN_ERROR("Invalid request 3", "INVALID_REQUEST_3");
            }

            await updateEncryptedTwoFactorAuthKey(c, user.id, null);
            await updateEncryptedTwoFactorAuthRecoveryCode(c, user.id, null);

            await createUserSessionAndSetCookie(c, user.id);
            deleteCookie(c, TWO_FACTOR_AUTH_COOKIE_NAME);

            return c.json({
                data: "success",
                error: null as ErrorType
            }, 200);

        }
    ).post(
        '/generate-new-recovery-code',
        zValidator('form', z.object({
            turnstile: z.string().min(1, { message: "Verification required" }),
        })),
        async (c) => {
            const { turnstile } = c.req.valid('form');
            const {
                TURNSTILE_SECRET,
                ENCRYPTION_KEY
            } = env(c);
            await validateTurnstile(TURNSTILE_SECRET, turnstile, c.req.header('X-Forwarded-For'));
            const user = c.get("USER");
            if (!user || !user.id) {
                throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
            }
            if (!user.hasNewSession) {
                throw new KNOWN_ERROR("A fresh login is required", "FRESH_SESSION_REQUIRED");
            }
            // get user by email
            const savedUser = await getUserByEmail(c, user.email);
            if (!savedUser) {
                throw new KNOWN_ERROR("User not saved", "USER_NOT_SAVED");
            }

            // user should have a recovery code already
            if (!savedUser.encryptedTwoFactorAuthRecoveryCode) {
                throw new KNOWN_ERROR("User does not have a recovery code", "USER_DOES_NOT_HAVE_RECOVERY_CODE");
            }

            const newRecoveryCode = generateRandomRecoveryCode();
            const encryptedRecoveryCode = encryptString(newRecoveryCode, ENCRYPTION_KEY);
            await updateEncryptedTwoFactorAuthRecoveryCode(c, savedUser.id, encryptedRecoveryCode);

            return c.json({
                data: newRecoveryCode,
                error: null as ErrorType
            }, 200);

        }
    )
    .post(
        '/get-recovery-code',
        zValidator('form', z.object({
            turnstile: z.string().min(1, { message: "Verification required" }),
        })),
        async (c) => {
            const { turnstile } = c.req.valid('form');
            const {
                TURNSTILE_SECRET,
                ENCRYPTION_KEY
            } = env(c);
            await validateTurnstile(TURNSTILE_SECRET, turnstile, c.req.header('X-Forwarded-For'));
            const user = c.get("USER");
            if (!user || !user.id) {
                throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
            }
            if (!user.hasNewSession) {
                throw new KNOWN_ERROR("A fresh login is required", "FRESH_SESSION_REQUIRED");
            }
            const savedUser = await getUserByEmail(c, user.email);
            if (!savedUser) {
                throw new KNOWN_ERROR("Invalid request 1", "INVALID_REQUEST_1");
            }
            if (!savedUser.encryptedTwoFactorAuthRecoveryCode) {
                throw new KNOWN_ERROR("Invalid request 2", "INVALID_REQUEST_2");
            }
            const decryptedRecoveryCode = decryptToString(savedUser.encryptedTwoFactorAuthRecoveryCode, ENCRYPTION_KEY);
            return c.json({
                data: decryptedRecoveryCode,
                error: null as ErrorType
            }, 200);
        }
    )
    .post(
        '/remove-2fa',
        zValidator('form', z.object({
            turnstile: z.string().min(1, { message: "Verification required" }),
        })),
        async (c) => {
            const { turnstile } = c.req.valid('form');
            const {
                TURNSTILE_SECRET,
            } = env(c);
            await validateTurnstile(TURNSTILE_SECRET, turnstile, c.req.header('X-Forwarded-For'));
            const user = c.get("USER");
            if (!user || !user.id) {
                throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
            }
            if (!user.hasNewSession) {
                throw new KNOWN_ERROR("A fresh login is required", "FRESH_SESSION_REQUIRED");
            }
            const savedUser = await getUserByEmail(c, user.email);
            if (!savedUser) {
                throw new KNOWN_ERROR("Invalid request 1", "INVALID_REQUEST_1");
            }
            await updateEncryptedTwoFactorAuthKey(c, user.id, null);
            await updateEncryptedTwoFactorAuthRecoveryCode(c, user.id, null);
            return c.json({
                data: "success",
                error: null as ErrorType
            }, 200);
        }
    )