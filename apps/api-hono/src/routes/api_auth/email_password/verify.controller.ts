import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { validateTurnstile } from '@api-hono/utils/validateTurnstile';
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import { hashPassword } from '@api-hono/utils/password';
import { createUserSessionAndSetCookie } from '@api-hono/utils/createUserSessionAndSetCookie';
import { decryptAndVerifyJwt } from '@api-hono/utils/jwt';
import { OTP_COOKIE_NAME_AFTER_REGISTER } from '@lib/consts';
import { deleteCookie, getCookie } from 'hono/cookie';
import { getEnvVariable } from '@lib/utils/getEnvVariable';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';
import type { OtpTokenAfterRegisterPayload } from './register.controller';
import { isEmailExistsService } from '@db/services/user.service';
import { updateUserNameService, markEmailAsVerifiedService, upsertUserService } from '@db/services/user.service';

export const verifyEmailPasswordSchemaValidator = zValidator('form', z.object({
    verifyEmail: z.string().email().max(200),
    code: z.string().min(1, { message: "One-time password required" }).max(6, { message: "6 digits required" }),
    turnstile: z.string().min(1, { message: "Verification required" })
}))
export const verifyEmailPasswordRoute = async (
    c: Context<
        HonoVariables,
        "/verify",
        ValidatorContext<typeof verifyEmailPasswordSchemaValidator>
    >
) => {
    const { verifyEmail, code, turnstile } = c.req.valid('form');
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);
    const otpToken = getCookie(c, OTP_COOKIE_NAME_AFTER_REGISTER);
    if (!otpToken) {
        throw new KNOWN_ERROR("Invalid or expired OTP", "INVALID_OTP");
    }
    const { email, otp, password, name } = await decryptAndVerifyJwt<OtpTokenAfterRegisterPayload>(
        getEnvVariable('JWT_PRIVATE_KEY'),
        getEnvVariable('ENCRYPTION_KEY'),
        otpToken
    );
    if (verifyEmail.toUpperCase() !== email.toUpperCase() || otp.toUpperCase() !== code.toUpperCase()) {
        throw new KNOWN_ERROR("Invalid OTP", "INVALID_OTP");
    }
    deleteCookie(c, OTP_COOKIE_NAME_AFTER_REGISTER);
    const isRegistered = await isEmailExistsService(email);
    if (isRegistered) {
        throw new KNOWN_ERROR("already registered", "ALREADY_REGISTERED");
    }

    const user = await upsertUserService(email, await hashPassword(password));
    await updateUserNameService(user.id, name);
    await markEmailAsVerifiedService(email);
    await createUserSessionAndSetCookie(c, user.id);

    return c.json({
        data: "success",
        error: null as ErrorType
    }, 200);
}