import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { generateOTPJsOnly } from '../utils/generateRandomOtp';
import { signJwtAndEncrypt } from '../utils/jwt';
import { OTP_COOKIE_NAME } from 'lib/auth-consts';
import { sendUserOtpEmail } from '../utils/email';
import { validateTurnstile } from 'lib/utils/validateTurnstile';
import { setCookie } from 'hono/cookie';
import { type ErrorType } from 'lib/errors';
import { ENFORCE_HOSTNAME_CHECKS } from '../enforceHostnameChecks';
import { getEnvVariable } from 'lib/utils/getEnvVariable';
import type { HonoVariables } from "../index";
import type { ValidatorContext } from 'lib/types/hono/ValidatorContext';


export const sendOtpSchemaValidator = zValidator('form', z.object({
    verifyEmail: z.string().email().max(200),
    turnstile: z.string().min(1, { message: "Verification required" })
}))
export const sendOtpRoute = async (
    c: Context<
        HonoVariables,
        "/send",
        ValidatorContext<typeof sendOtpSchemaValidator>
    >
) => {
    const { verifyEmail, turnstile } = c.req.valid('form');
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);

    const otp = generateOTPJsOnly();
    const otpToken = await signJwtAndEncrypt<OtpTokenPayload>(
        getEnvVariable('JWT_PRIVATE_KEY'),
        getEnvVariable('ENCRYPTION_KEY'),
        {
            nonce: crypto.randomUUID(),
            email: verifyEmail,
            otp,
        }
    );

    setCookie(c, OTP_COOKIE_NAME, otpToken, {
        path: "/",
        secure: ENFORCE_HOSTNAME_CHECKS,
        httpOnly: true,
        maxAge: 600, // 10 minutes
        sameSite: "strict"
    });

    await sendUserOtpEmail(verifyEmail, otp);

    return c.json({
        data: "success",
        error: null as ErrorType
    }, 200);
}


export type OtpTokenPayload = {
    nonce: string;
    email: string;
    otp: string;
}