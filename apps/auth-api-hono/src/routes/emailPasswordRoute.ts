import { Hono } from 'hono'
import type { honoTypes } from '../index'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { validateTurnstile } from '../utils/validateTurnstile';
import { KNOWN_ERROR, type ErrorType } from '../errors';
import { hashPassword, verifyPasswordHash, verifyPasswordStrength } from '../utils/password';
import { getUserByEmail, isEmailExists, markEmailAsVerified, updateUserName, upsertUser } from '../db/db-actions/userActions';
import { createUserSessionAndSetCookie } from '../db/db-actions/createSession';
import { getEnvironmentVariable, IS_PROD } from '../utils/getEnvironmentVariable';
import { decryptAndVerifyJwt, signJwtAndEncrypt } from '../utils/jwt';
import type { TwoFactorAuthVerifyPayload } from '../types/UserType';
import { OTP_COOKIE_NAME_AFTER_REGISTER, TWO_FACTOR_AUTH_COOKIE_NAME } from '../consts';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { generateOTPJsOnly } from '../utils/generateRandomOtp';
import { sendUserOtpEmail } from '../utils/email';

const PUBLIC_DOMAIN_NAME = getEnvironmentVariable("PUBLIC_DOMAIN_NAME");

export const emailPasswordRoute = new Hono<honoTypes>()
    .use(async (c, next) => {
        // const referer = c.req.header('referer');
        // const host = c.req.header('host');
        const origin = c.req.header('origin');
        if (origin !== `https://auth.${PUBLIC_DOMAIN_NAME}`) {
            throw new KNOWN_ERROR("Invalid origin", "INVALID_ORIGIN");
        }
        await next();
    })
    .post(
        '/register',
        zValidator('form', z.object({
            email: z.string().email(),
            password: z.string()
                .min(8, { message: "Password must be at least 8 characters" })
                .max(255, { message: "Password must be at most 255 characters" })
                .refine(
                    async (password) => {
                        return await verifyPasswordStrength(password);
                    },
                    { message: "Password is too weak or has been compromised" }
                ),
            name: z.string().min(1, { message: "Name required" }).max(255, { message: "Name must be at most 255 characters" }),
            turnstile: z.string().min(1, { message: "Verification required" })
        })),
        async (c) => {
            const { email, password, name, turnstile } = c.req.valid('form');
            await validateTurnstile(turnstile, c.req.header('X-Forwarded-For'));

            const isRegistered = await isEmailExists(email);
            if (isRegistered) {
                throw new KNOWN_ERROR("already registered", "ALREADY_REGISTERED");
            }

            // Do not store user without verification
            // const user = await upsertUser(email, await hashPassword(password));
            // await updateUserName(user.id, name);

            // verify email with one time password authentication
            // throw new KNOWN_ERROR("OTP required", "OTP_REQUIRED");

            // save user after otp verification
            const otp = generateOTPJsOnly();
            const otpToken = await signJwtAndEncrypt<OtpTokenAfterRegisterPayload>(
                {
                    nonce: crypto.randomUUID(),
                    email: email,
                    password: password,
                    name: name,
                    otp,
                }
            );
            setCookie(c, OTP_COOKIE_NAME_AFTER_REGISTER, otpToken, {
                path: "/",
                secure: IS_PROD,
                httpOnly: true,
                maxAge: 600, // 10 minutes
                sameSite: "strict"
            });
            await sendUserOtpEmail(email, otp);
            return c.json({
                data: "success",
                error: null as ErrorType
            }, 200);
        }
    )
    .post(
        '/verify',
        zValidator('form', z.object({
            verifyEmail: z.string().email().max(200),
            code: z.string().min(1, { message: "One-time password required" }).max(6, { message: "6 digits required" }),
            turnstile: z.string().min(1, { message: "Verification required" })
        })),
        async (c) => {
            const { verifyEmail, code, turnstile } = c.req.valid('form');
            await validateTurnstile(turnstile, c.req.header('X-Forwarded-For'));
            const otpToken = getCookie(c, OTP_COOKIE_NAME_AFTER_REGISTER);
            if (!otpToken) {
                throw new KNOWN_ERROR("Invalid or expired OTP", "INVALID_OTP");
            }
            const { email, otp, password, name } = await decryptAndVerifyJwt<OtpTokenAfterRegisterPayload>(
                otpToken
            );
            if (verifyEmail.toUpperCase() !== email.toUpperCase() || otp.toUpperCase() !== code.toUpperCase()) {
                throw new KNOWN_ERROR("Invalid OTP", "INVALID_OTP");
            }
            deleteCookie(c, OTP_COOKIE_NAME_AFTER_REGISTER);
            const isRegistered = await isEmailExists(email);
            if (isRegistered) {
                throw new KNOWN_ERROR("already registered", "ALREADY_REGISTERED");
            }

            const user = await upsertUser(email, await hashPassword(password));
            await updateUserName(user.id, name);
            await markEmailAsVerified(email);
            await createUserSessionAndSetCookie(c, user.id);

            return c.json({
                data: "success",
                error: null as ErrorType
            }, 200);
        }
    )
    .post(
        '/login',
        zValidator('form', z.object({
            email: z.string().email(),
            password: z.string().min(8, { message: "Password required" }).max(255),
            turnstile: z.string().min(1, { message: "Verification required" })
        })),
        async (c) => {
            const { email, password, turnstile } = c.req.valid('form');
            await validateTurnstile(turnstile, c.req.header('X-Forwarded-For'));
            const isRegistered = await isEmailExists(email);
            if (!isRegistered) {
                throw new KNOWN_ERROR("Email not registered", "EMAIL_NOT_REGISTERED");
            }
            const user = await getUserByEmail(email);
            if (!user) {
                throw new KNOWN_ERROR("Invalid email or password", "INVALID_EMAIL_OR_PASSWORD");
            }
            if (!user.passwordHash) {
                throw new KNOWN_ERROR("Invalid email or password", "INVALID_EMAIL_OR_PASSWORD");
            }
            if (!await verifyPasswordHash(user.passwordHash, password)) {
                throw new KNOWN_ERROR("Invalid email or password", "INVALID_EMAIL_OR_PASSWORD");
            }
            if (!user.isEmailVerified) {
                // verify email with one time password authentication
                throw new KNOWN_ERROR("OTP required", "OTP_REQUIRED");
            }

            if (user.encryptedTwoFactorAuthKey) {
                const twoFactorAuthToken = await signJwtAndEncrypt<TwoFactorAuthVerifyPayload>(
                    {
                        nonce: crypto.randomUUID(),
                        userId: user.id,
                        email: user.email,
                    }
                );
                setCookie(c, TWO_FACTOR_AUTH_COOKIE_NAME, twoFactorAuthToken, {
                    path: "/",
                    secure: IS_PROD,
                    httpOnly: true,
                    maxAge: 600, // 10 minutes
                    sameSite: "strict"
                });
                throw new KNOWN_ERROR("Two factor authentication required", "TWO_FACTOR_AUTH_REQUIRED");
            }

            await createUserSessionAndSetCookie(c, user.id);

            return c.json({
                data: "success",
                error: null as ErrorType
            }, 200);
        }
    )

type OtpTokenAfterRegisterPayload = {
    nonce: string;
    email: string;
    password: string;
    name: string;
    otp: string;
}