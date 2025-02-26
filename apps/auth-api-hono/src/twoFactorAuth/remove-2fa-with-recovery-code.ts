import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { KNOWN_ERROR, type ErrorType } from 'lib/errors';
import { decryptToString } from '../utils/encryption';
import { deleteCookie, getCookie } from 'hono/cookie';
import { TWO_FACTOR_AUTH_COOKIE_NAME } from 'lib/auth-consts';
import { decryptAndVerifyJwt } from '../utils/jwt';
import type { TwoFactorAuthVerifyPayload } from '../types/UserType';
import { validateTurnstile } from 'lib/utils/validateTurnstile';
import { createUserSessionAndSetCookie } from '../utils/createUserSessionAndSetCookie';
import { getEnvVariable } from 'lib/utils/getEnvVariable';
import type { HonoVariables } from "../index";
import type { ValidatorContext } from 'lib/hono/types/ValidatorContext';
import { getUserByEmailService } from '../db/schema/user.service';
import { updateEncryptedTwoFactorAuthKeyService, updateEncryptedTwoFactorAuthRecoveryCodeService } from '../db/schema/user.service';


export const removeTwoFactorAuthSchemaValidator = zValidator('form', z.object({
    turnstile: z.string().min(1, { message: "Verification required" }),
    recoveryCode: z.string().min(1, { message: "Recovery code required" }),
}))
export const removeTwoFactorAuthRoute = async (c: Context<HonoVariables, "/two-factor-auth/remove", ValidatorContext<typeof removeTwoFactorAuthSchemaValidator>>) => {
    const { turnstile, recoveryCode } = c.req.valid('form');
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);
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