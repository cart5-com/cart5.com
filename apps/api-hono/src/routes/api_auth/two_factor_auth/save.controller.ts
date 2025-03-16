import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { decodeBase64 } from "@oslojs/encoding";
import { verifyTOTPWithGracePeriod } from "@oslojs/otp";
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import { generateRandomRecoveryCode } from '@api-hono/utils/generateRandomOtp';
import { encryptAesGcm, encryptString } from '@api-hono/utils/encryption';
import { validateTurnstile } from '@api-hono/utils/validateTurnstile';
import { getEnvVariable } from '@lib/utils/getEnvVariable';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { updateEncryptedTwoFactorAuthKeyService } from '@db/services/user.service';
import { updateEncryptedTwoFactorAuthRecoveryCodeService } from '@db/services/user.service';
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';


export const saveTwoFactorAuthSchemaValidator = zValidator('form', z.object({
    encodedTOTPKey: z.string().length(28, { message: "Invalid TOTP key length" }),
    userProvidedCode: z.string().length(6, { message: "TOTP code must be 6 digits" }),
    turnstile: z.string().min(1, { message: "Verification required" })
}));
export const saveTwoFactorAuthRoute = async (
    c: Context<
        HonoVariables,
        "/save",
        ValidatorContext<typeof saveTwoFactorAuthSchemaValidator>
    >
) => {
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (!user.hasNewSession) {
        throw new KNOWN_ERROR("A fresh login is required", "FRESH_SESSION_REQUIRED");
    }
    if (user.has2FA) {
        throw new KNOWN_ERROR("User already has 2FA enabled", "USER_ALREADY_HAS_2FA_ENABLED");
    }
    const { encodedTOTPKey, userProvidedCode, turnstile } = c.req.valid('form');
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);
    let key: Uint8Array;
    try {
        key = decodeBase64(encodedTOTPKey);
        // Validate key byte length
        if (key.byteLength !== 20) {
            throw new KNOWN_ERROR("Invalid key byte length", "INVALID_KEY");
        }
    } catch {
        throw new KNOWN_ERROR("Invalid TOTP key format", "INVALID_KEY");
    }

    if (!verifyTOTPWithGracePeriod(key, 30, 6, userProvidedCode, 30)) {
        throw new KNOWN_ERROR("Invalid TOTP code", "INVALID_TOTP");
    }

    const encryptedKey = encryptAesGcm(key, getEnvVariable('ENCRYPTION_KEY'));
    await updateEncryptedTwoFactorAuthKeyService(user.id, encryptedKey);
    const recoveryCode = generateRandomRecoveryCode();
    const encryptedRecoveryCode = encryptString(recoveryCode, getEnvVariable('ENCRYPTION_KEY'));
    await updateEncryptedTwoFactorAuthRecoveryCodeService(user.id, encryptedRecoveryCode);

    return c.json({
        data: {
            recoveryCode,
        },
        error: null as ErrorType
    }, 200);
}