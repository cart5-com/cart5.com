import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import { generateRandomRecoveryCode } from '@api-hono/utils/generateRandomOtp';
import { encryptString } from '@api-hono/utils/encryption';
import { validateTurnstile } from '@api-hono/utils/validateTurnstile';
import { getEnvVariable } from '@lib/utils/getEnvVariable';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { getUserByEmailService } from '@db/services/user.service';
import { updateEncryptedTwoFactorAuthRecoveryCodeService } from '@db/services/user.service';
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';


export const generateNewRecoveryCodeSchemaValidator = zValidator('form', z.object({
    turnstile: z.string().min(1, { message: "Verification required" }),
}))
export const generateNewRecoveryCodeRoute = async (c: Context<HonoVariables, "/two-factor-auth/generate-new-recovery-code", ValidatorContext<typeof generateNewRecoveryCodeSchemaValidator>>) => {
    const { turnstile } = c.req.valid('form');
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (!user.hasNewSession) {
        throw new KNOWN_ERROR("A fresh login is required", "FRESH_SESSION_REQUIRED");
    }
    // get user by email
    const savedUser = await getUserByEmailService(user.email);
    if (!savedUser) {
        throw new KNOWN_ERROR("User not saved", "USER_NOT_SAVED");
    }

    // user should have a recovery code already
    if (!savedUser.encryptedTwoFactorAuthRecoveryCode) {
        throw new KNOWN_ERROR("User does not have a recovery code", "USER_DOES_NOT_HAVE_RECOVERY_CODE");
    }

    const newRecoveryCode = generateRandomRecoveryCode();
    const encryptedRecoveryCode = encryptString(newRecoveryCode, getEnvVariable('ENCRYPTION_KEY'));
    await updateEncryptedTwoFactorAuthRecoveryCodeService(savedUser.id, encryptedRecoveryCode);

    return c.json({
        data: newRecoveryCode,
        error: null as ErrorType
    }, 200);
}
