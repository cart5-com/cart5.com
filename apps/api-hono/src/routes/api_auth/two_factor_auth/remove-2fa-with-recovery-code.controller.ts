import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import { decryptToString } from '@api-hono/utils/encryption';
import { deleteCookie, getCookie } from 'hono/cookie';
import { TWO_FACTOR_AUTH_COOKIE_NAME } from '@lib/consts';
import { decryptAndVerifyJwt } from '@api-hono/utils/jwt';
import type { TwoFactorAuthVerifyPayload } from '@lib/types/UserType';
import { validateTurnstile } from '@api-hono/utils/validateTurnstile';
import { createUserSessionAndSetCookie } from '@api-hono/utils/createUserSessionAndSetCookie';
import { getEnvVariable } from '@lib/utils/getEnvVariable';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';
import { getUserByEmailService } from '@db/services/user.service';
import { updateEncryptedTwoFactorAuthKeyService, updateEncryptedTwoFactorAuthRecoveryCodeService } from '@db/services/user.service';
import { getIpAddress } from '@api-hono/utils/ip_address';


export const removeTwoFactorAuthSchemaValidator = zValidator('form', z.object({
    turnstile: z.string().min(1, { message: "Verification required" }),
    recoveryCode: z.string().min(1, { message: "Recovery code required" }),
}))
export const removeTwoFactorAuthRoute = async (c: Context<HonoVariables, "/two-factor-auth/remove", ValidatorContext<typeof removeTwoFactorAuthSchemaValidator>>) => {
    const { turnstile, recoveryCode } = c.req.valid('form');
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
        throw new KNOWN_ERROR("Invalid request 1", "INVALID_REQUEST_1");
    }
    if (!user.encryptedTwoFactorAuthRecoveryCode) {
        throw new KNOWN_ERROR("Invalid request 2", "INVALID_REQUEST_2");
    }
    const decryptedRecoveryCode = decryptToString(user.encryptedTwoFactorAuthRecoveryCode, getEnvVariable('ENCRYPTION_KEY'));
    if (decryptedRecoveryCode !== recoveryCode) {
        throw new KNOWN_ERROR("Invalid request 3", "INVALID_REQUEST_3");
    }

    await updateEncryptedTwoFactorAuthKeyService(user.id, null);
    await updateEncryptedTwoFactorAuthRecoveryCodeService(user.id, null);

    await createUserSessionAndSetCookie(c, user.id);
    deleteCookie(c, TWO_FACTOR_AUTH_COOKIE_NAME);

    return c.json({
        data: "success",
        error: null as ErrorType
    }, 200);
}