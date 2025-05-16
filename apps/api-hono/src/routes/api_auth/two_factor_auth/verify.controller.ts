import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { verifyTOTPWithGracePeriod } from "@oslojs/otp";
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import { decryptAesGcm } from '@api-hono/utils/encryption';
import { deleteCookie, getCookie } from 'hono/cookie';
import { TWO_FACTOR_AUTH_COOKIE_NAME } from '@lib/consts';
import { decryptAndVerifyJwt } from '@api-hono/utils/jwt';
import type { TwoFactorAuthVerifyPayload } from '@lib/types/UserType';
import { validateTurnstile } from '@api-hono/utils/validateTurnstile';
import { getEnvVariable } from '@lib/utils/getEnvVariable';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { getUserByEmailService } from '@db/services/user.service';
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';
import { createUserSessionAndSetCookie } from '@api-hono/utils/createUserSessionAndSetCookie';
import { getIpAddress } from '@api-hono/utils/ip_address';


export const verifyTwoFactorAuthSchemaValidator = zValidator('form', z.object({
    userProvidedCode: z.string().length(6, { message: "TOTP code must be 6 digits" }),
    turnstile: z.string().min(1, { message: "Verification required" })
}))
export const verifyTwoFactorAuthRoute = async (
    c: Context<
        HonoVariables,
        "/verify",
        ValidatorContext<typeof verifyTwoFactorAuthSchemaValidator>
    >
) => {
    const { userProvidedCode, turnstile } = c.req.valid('form');
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, getIpAddress(c));
    const twoFactorAuthToken = getCookie(c, TWO_FACTOR_AUTH_COOKIE_NAME);

    if (!twoFactorAuthToken) {
        throw new KNOWN_ERROR("Invalid or expired two factor authentication token", "INVALID_TWO_FACTOR_AUTH_TOKEN");
    }

    const { email } = await decryptAndVerifyJwt<TwoFactorAuthVerifyPayload>(
        getEnvVariable('JWT_PRIVATE_KEY'),
        getEnvVariable('ENCRYPTION_KEY'),
        twoFactorAuthToken
    );
    const user = await getUserByEmailService(email);
    if (!user) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (!user.encryptedTwoFactorAuthKey) {
        // no need to throw error here, as it's not expected to happen
        throw new KNOWN_ERROR("UNKNOWN_ERROR", "UNKNOWN_ERROR");
    }
    if (!verifyTOTPWithGracePeriod(decryptAesGcm(user.encryptedTwoFactorAuthKey, getEnvVariable('ENCRYPTION_KEY')), 30, 6, userProvidedCode, 30)) {
        throw new KNOWN_ERROR("Invalid TOTP code", "INVALID_TOTP");
    }

    await createUserSessionAndSetCookie(c, user.id);
    deleteCookie(c, TWO_FACTOR_AUTH_COOKIE_NAME);

    return c.json({
        data: "success",
        error: null as ErrorType
    }, 200);
}