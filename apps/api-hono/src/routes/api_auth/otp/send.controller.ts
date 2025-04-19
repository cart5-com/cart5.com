import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { generateOTPJsOnly } from '@api-hono/utils/generateRandomOtp';
import { signJwtAndEncrypt } from '@api-hono/utils/jwt';
import { OTP_COOKIE_NAME } from '@lib/consts';
import { sendUserOtpEmail } from '@api-hono/utils/email';
import { validateTurnstile } from '@api-hono/utils/validateTurnstile';
import { setCookie } from 'hono/cookie';
import { type ErrorType } from '@lib/types/errors';
import { ENFORCE_HOSTNAME_CHECKS } from '@lib/utils/enforceHostnameChecks';
import { getEnvVariable } from '@lib/utils/getEnvVariable';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';


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
    // TODO always reject domains listed in blacklist
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