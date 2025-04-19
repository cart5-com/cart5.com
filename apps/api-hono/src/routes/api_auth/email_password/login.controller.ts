import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { validateTurnstile } from '@api-hono/utils/validateTurnstile';
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import { verifyPasswordHash } from '@api-hono/utils/password';
import { createUserSessionAndSetCookie } from '@api-hono/utils/createUserSessionAndSetCookie';
import { signJwtAndEncrypt } from '@api-hono/utils/jwt';
import type { TwoFactorAuthVerifyPayload } from '@lib/types/UserType';
import { TWO_FACTOR_AUTH_COOKIE_NAME } from '@lib/consts';
import { setCookie } from 'hono/cookie';
import { ENFORCE_HOSTNAME_CHECKS } from '@lib/utils/enforceHostnameChecks';
import { getEnvVariable } from '@lib/utils/getEnvVariable';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';
import { isEmailExistsService } from '@db/services/user.service';
import { getUserByEmailService } from '@db/services/user.service';


export const loginEmailPasswordSchemaValidator = zValidator('form', z.object({
    email: z.string().email(),
    password: z.string().min(8, { message: "Password required" }).max(255),
    turnstile: z.string().min(1, { message: "Verification required" })
}))
export const loginEmailPasswordRoute = async (
    c: Context<HonoVariables, "/otp/verify", ValidatorContext<typeof loginEmailPasswordSchemaValidator>>
) => {
    // TODO always reject domains listed in blacklist
    const { email, password, turnstile } = c.req.valid('form');
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);
    const isRegistered = await isEmailExistsService(email);
    if (!isRegistered) {
        throw new KNOWN_ERROR("Email not registered", "EMAIL_NOT_REGISTERED");
    }
    const user = await getUserByEmailService(email);
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

