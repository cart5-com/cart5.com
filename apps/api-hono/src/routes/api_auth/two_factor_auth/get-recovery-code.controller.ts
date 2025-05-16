import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { KNOWN_ERROR, type ErrorType } from '@lib/types/errors';
import { decryptToString } from '@api-hono/utils/encryption';
import { validateTurnstile } from '@api-hono/utils/validateTurnstile';
import { getEnvVariable } from '@lib/utils/getEnvVariable';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { getUserByEmailService } from '@db/services/user.service';
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';
import { getIpAddress } from '@api-hono/utils/ip_address';


export const getRecoveryCodeSchemaValidator = zValidator('form', z.object({
    turnstile: z.string().min(1, { message: "Verification required" }),
}))
export const getRecoveryCodeRoute = async (
    c: Context<
        HonoVariables,
        "/two-factor-auth/get-recovery-code",
        ValidatorContext<typeof getRecoveryCodeSchemaValidator>
    >
) => {
    const { turnstile } = c.req.valid('form');
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, getIpAddress(c));
    const user = c.get("USER");
    if (!user || !user.id) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (!user.hasNewSession) {
        throw new KNOWN_ERROR("A fresh login is required", "FRESH_SESSION_REQUIRED");
    }
    const savedUser = await getUserByEmailService(user.email);
    if (!savedUser) {
        throw new KNOWN_ERROR("Invalid request 1", "INVALID_REQUEST_1");
    }
    if (!savedUser.encryptedTwoFactorAuthRecoveryCode) {
        throw new KNOWN_ERROR("Invalid request 2", "INVALID_REQUEST_2");
    }
    const decryptedRecoveryCode = decryptToString(savedUser.encryptedTwoFactorAuthRecoveryCode, getEnvVariable('ENCRYPTION_KEY'));
    return c.json({
        data: decryptedRecoveryCode,
        error: null as ErrorType
    }, 200);
}