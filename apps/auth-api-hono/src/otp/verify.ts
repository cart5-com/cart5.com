import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { decryptAndVerifyJwt, signJwtAndEncrypt } from '../utils/jwt';
import { OTP_COOKIE_NAME, TWO_FACTOR_AUTH_COOKIE_NAME } from 'lib/auth-consts';
import { validateTurnstile } from 'lib/utils/validateTurnstile';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { KNOWN_ERROR, type ErrorType } from 'lib/errors';
import { upsertUserService, markEmailAsVerifiedService } from '../db/schema/user.service';
import { createUserSessionAndSetCookie } from '../utils/createUserSessionAndSetCookie';
import type { TwoFactorAuthVerifyPayload } from '../types/UserType';
import { ENFORCE_HOSTNAME_CHECKS } from '../enforceHostnameChecks';
import { getEnvVariable } from 'lib/utils/getEnvVariable';
import type { HonoVariables } from "../index";
import { updateUserNameService } from '../db/schema/user.service';
import type { ValidatorContext } from 'lib/types/hono/ValidatorContext';
import type { OtpTokenPayload } from './send';


export const verifyOtpSchemaValidator = zValidator('form', z.object({
    verifyEmail: z.string().email().max(200),
    code: z.string().min(1, { message: "One-time password required" }).max(6, { message: "6 digits required" }),
    turnstile: z.string().min(1, { message: "Verification required" })
}))
export const verifyOtpRoute = async (
    c: Context<
        HonoVariables,
        "/verify",
        ValidatorContext<typeof verifyOtpSchemaValidator>
    >
) => {
    const { verifyEmail, code, turnstile } = c.req.valid('form');
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);
    const otpToken = getCookie(c, OTP_COOKIE_NAME);


    if (!otpToken) {
        throw new KNOWN_ERROR("Invalid or expired OTP", "INVALID_OTP");
    }
    const { email, otp } = await decryptAndVerifyJwt<OtpTokenPayload>(
        getEnvVariable('JWT_PRIVATE_KEY'),
        getEnvVariable('ENCRYPTION_KEY'),
        otpToken
    );
    if (verifyEmail.toUpperCase() !== email.toUpperCase() || otp.toUpperCase() !== code.toUpperCase()) {
        throw new KNOWN_ERROR("Invalid OTP", "INVALID_OTP");
    }
    deleteCookie(c, OTP_COOKIE_NAME);
    const user = await upsertUserService(email);

    if (!user.isEmailVerified) {
        await markEmailAsVerifiedService(email);
    }
    if (user.name === null) {
        await updateUserNameService(user.id, email.split('@')[0]);
    }

    if (user.encryptedTwoFactorAuthKey) {
        const twoFactorAuthToken = await signJwtAndEncrypt<TwoFactorAuthVerifyPayload>(
            getEnvVariable('JWT_PRIVATE_KEY'),
            getEnvVariable('ENCRYPTION_KEY'),
            {
                nonce: crypto.randomUUID(),
                userId: user.id,
                email: user.email,
            }
        );
        setCookie(c, TWO_FACTOR_AUTH_COOKIE_NAME, twoFactorAuthToken, {
            path: "/",
            secure: ENFORCE_HOSTNAME_CHECKS,
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