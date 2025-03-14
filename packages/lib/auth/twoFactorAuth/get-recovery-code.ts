import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { KNOWN_ERROR, type ErrorType } from '../../types/errors';
import { decryptToString } from '../utils/encryption';
import { validateTurnstile } from '../../utils/validateTurnstile';
import { getEnvVariable } from '../../utils/getEnvVariable';
import type { HonoVariables } from "../../hono/HonoVariables";
import { getUserByEmailService } from '../../db/services/user.service';
import type { ValidatorContext } from '../../hono/types/ValidatorContext';


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
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);
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