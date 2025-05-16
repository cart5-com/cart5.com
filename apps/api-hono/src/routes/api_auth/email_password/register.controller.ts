import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { validateTurnstile } from '@api-hono/utils/validateTurnstile';
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import { verifyPasswordStrength } from '@api-hono/utils/password';
import { isEmailExistsService } from '@db/services/user.service';
import { signJwtAndEncrypt } from '@api-hono/utils/jwt';
import { OTP_COOKIE_NAME_AFTER_REGISTER } from '@lib/consts';
import { setCookie } from 'hono/cookie';
import { generateOTPJsOnly } from '@api-hono/utils/generateRandomOtp';
import { sendUserOtpEmail } from '@api-hono/utils/email';
import { ENFORCE_HOSTNAME_CHECKS } from '@lib/utils/enforceHostnameChecks';
import { getEnvVariable } from '@lib/utils/getEnvVariable';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';
import { getIpAddress } from '@api-hono/utils/ip_address';


export const registerEmailPasswordSchemaValidator = zValidator('form', z.object({
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
}))
export const registerEmailPasswordRoute = async (
    c: Context<
        HonoVariables,
        "/register",
        ValidatorContext<typeof registerEmailPasswordSchemaValidator>
    >
) => {
    // TODO always reject domains listed in blacklist
    const { email, password, name, turnstile } = c.req.valid('form');
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, getIpAddress(c));

    const isRegistered = await isEmailExistsService(email);
    if (isRegistered) {
        throw new KNOWN_ERROR("already registered", "ALREADY_REGISTERED");
    }

    // Do not store user without verification
    // const user = await upsertUser(email, await hashPassword(password));
    // await updateUserNameService(user.id, name);

    // verify email with one time password authentication
    // throw new KNOWN_ERROR("OTP required", "OTP_REQUIRED");

    // save user after otp verification
    const otp = generateOTPJsOnly();
    const otpToken = await signJwtAndEncrypt<OtpTokenAfterRegisterPayload>(
        getEnvVariable('JWT_PRIVATE_KEY'),
        getEnvVariable('ENCRYPTION_KEY'),
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
        secure: ENFORCE_HOSTNAME_CHECKS,
        httpOnly: true,
        maxAge: 600, // 10 minutes
        sameSite: "strict"
    });
    sendUserOtpEmail(email, otp);
    return c.json({
        data: "success",
        error: null as ErrorType
    }, 200);
}

export type OtpTokenAfterRegisterPayload = {
    nonce: string;
    email: string;
    password: string;
    name: string;
    otp: string;
}