import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { decryptAndVerifyJwt } from '@api-hono/utils/jwt';
import { PHONE_OTP_COOKIE_NAME } from '@lib/consts';
import { validateTurnstile } from '@api-hono/utils/validateTurnstile';
import { deleteCookie, getCookie } from 'hono/cookie';
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import { getEnvVariable } from '@lib/utils/getEnvVariable';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';
import type { PhoneOtpTokenPayload } from './send_otp.controller';
import { addVerifiedPhoneNumber_Service } from '@db/services/phone.service';

export const verifyPhoneOtpSchemaValidator = zValidator('form', z.object({
    code: z.string().min(4, { message: "One-time password required" }).max(4, { message: "4 digits required" }),
    turnstile: z.string().min(1, { message: "Verification required" })
}))

export const verifyPhoneOtpRoute = async (
    c: Context<
        HonoVariables,
        "/phone/verify_otp",
        ValidatorContext<typeof verifyPhoneOtpSchemaValidator>
    >
) => {
    const { code, turnstile } = c.req.valid('form');
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);

    // Get the user session to ensure they're logged in
    const session = c.var.SESSION;
    const user = c.var.USER;

    if (!session || !user) {
        throw new KNOWN_ERROR("Authentication required", "AUTHENTICATION_REQUIRED");
    }

    // Get the OTP token from the cookie
    const otpToken = getCookie(c, PHONE_OTP_COOKIE_NAME);
    if (!otpToken) {
        throw new KNOWN_ERROR("Invalid or expired OTP", "INVALID_OTP");
    }

    // Decrypt and verify the token
    let tokenData: PhoneOtpTokenPayload;
    try {
        tokenData = await decryptAndVerifyJwt<PhoneOtpTokenPayload>(
            getEnvVariable('JWT_PRIVATE_KEY'),
            getEnvVariable('ENCRYPTION_KEY'),
            otpToken
        );
    } catch (error) {
        throw new KNOWN_ERROR("Invalid or expired OTP", "INVALID_OTP");
    }

    if (tokenData.userId !== user.id) {
        throw new KNOWN_ERROR("Invalid user, please make sure logout and login again", "INVALID_USER");
    }

    // Verify the phone number and OTP code match what was sent
    if (
        code.toUpperCase() !== tokenData.otp.toUpperCase()
    ) {
        throw new KNOWN_ERROR("Invalid OTP", "INVALID_OTP");
    }

    // Clear the OTP cookie since it's been verified
    deleteCookie(c, PHONE_OTP_COOKIE_NAME);

    // Add the verified phone number to the user's account
    await addVerifiedPhoneNumber_Service(user.id, tokenData.phoneNumber);

    return c.json({
        data: "success",
        error: null as ErrorType
    }, 200);
} 