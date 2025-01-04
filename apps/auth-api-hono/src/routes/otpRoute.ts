import { Hono } from 'hono'
import type { honoTypes } from '../index'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { generateOTPJsOnly } from '../utils/generateRandomOtp';
import { decryptAndVerifyJwt, signJwtAndEncrypt } from '../utils/jwt';
import { OTP_COOKIE_NAME, TWO_FACTOR_AUTH_COOKIE_NAME } from '../consts';
import { sendUserOtpEmail } from '../utils/email';
import { validateTurnstile } from '../utils/validateTurnstile';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { KNOWN_ERROR, type ErrorType } from '../errors';
import { markEmailAsVerified, updateUserName, upsertUser } from '../db/db-actions/userActions';
import { createUserSessionAndSetCookie } from '../db/db-actions/createSession';
import type { TwoFactorAuthVerifyPayload } from '../types/UserType';
import { env } from 'hono/adapter';


export const otpRoute = new Hono<honoTypes>()
    .use(async (c, next) => {
        // const referer = c.req.header('referer');
        // const host = c.req.header('host');
        const origin = c.req.header('origin');
        if (origin !== `https://auth.${env(c).PUBLIC_DOMAIN_NAME}`) {
            throw new KNOWN_ERROR("Invalid origin", "INVALID_ORIGIN");
        }
        await next();
    })
    .post(
        '/send',
        zValidator('form', z.object({
            verifyEmail: z.string().email().max(200),
            turnstile: z.string().min(1, { message: "Verification required" })
        })),
        async (c) => {
            const { verifyEmail, turnstile } = c.req.valid('form');
            const {
                TURNSTILE_SECRET,
                JWT_SECRET,
                ENCRYPTION_KEY
            } = env(c);
            await validateTurnstile(TURNSTILE_SECRET, turnstile, c.req.header('X-Forwarded-For'));

            const otp = generateOTPJsOnly();
            const otpToken = await signJwtAndEncrypt<OtpTokenPayload>(
                JWT_SECRET,
                ENCRYPTION_KEY,
                {
                    nonce: crypto.randomUUID(),
                    email: verifyEmail,
                    otp,
                }
            );

            setCookie(c, OTP_COOKIE_NAME, otpToken, {
                path: "/",
                secure: c.get('IS_PROD'),
                httpOnly: true,
                maxAge: 600, // 10 minutes
                sameSite: "strict"
            });

            await sendUserOtpEmail(verifyEmail, otp, c);

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
            const {
                TURNSTILE_SECRET,
                JWT_SECRET,
                ENCRYPTION_KEY
            } = env(c);
            await validateTurnstile(TURNSTILE_SECRET, turnstile, c.req.header('X-Forwarded-For'));
            const otpToken = getCookie(c, OTP_COOKIE_NAME);


            if (!otpToken) {
                throw new KNOWN_ERROR("Invalid or expired OTP", "INVALID_OTP");
            }
            const { email, otp } = await decryptAndVerifyJwt<OtpTokenPayload>(
                JWT_SECRET,
                ENCRYPTION_KEY,
                otpToken
            );
            if (verifyEmail.toUpperCase() !== email.toUpperCase() || otp.toUpperCase() !== code.toUpperCase()) {
                throw new KNOWN_ERROR("Invalid OTP", "INVALID_OTP");
            }
            deleteCookie(c, OTP_COOKIE_NAME);
            const user = await upsertUser(c, email);

            if (!user.isEmailVerified) {
                await markEmailAsVerified(c, email);
            }
            if (user.name === null) {
                await updateUserName(c, user.id, email.split('@')[0]);
            }

            if (user.encryptedTwoFactorAuthKey) {
                const twoFactorAuthToken = await signJwtAndEncrypt<TwoFactorAuthVerifyPayload>(
                    JWT_SECRET,
                    ENCRYPTION_KEY,
                    {
                        nonce: crypto.randomUUID(),
                        userId: user.id,
                        email: user.email,
                    }
                );
                setCookie(c, TWO_FACTOR_AUTH_COOKIE_NAME, twoFactorAuthToken, {
                    path: "/",
                    secure: c.get('IS_PROD'),
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

type OtpTokenPayload = {
    nonce: string;
    email: string;
    otp: string;
}