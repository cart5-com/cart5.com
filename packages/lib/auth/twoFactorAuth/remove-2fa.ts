import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { KNOWN_ERROR, type ErrorType } from '../../errors';
import { validateTurnstile } from '../../utils/validateTurnstile';
import { getEnvVariable } from '../../utils/getEnvVariable';
import type { HonoVariables } from "../../hono/HonoVariables";
import { getUserByEmailService } from '../../db/schema/user.service';
import { updateEncryptedTwoFactorAuthKeyService } from '../../db/schema/user.service';
import { updateEncryptedTwoFactorAuthRecoveryCodeService } from '../../db/schema/user.service';
import type { ValidatorContext } from '../../hono/types/ValidatorContext';

export const remove2FASchemaValidator = zValidator('form', z.object({
    turnstile: z.string().min(1, { message: "Verification required" }),
}))
export const remove2FARoute = async (
    c: Context<
        HonoVariables,
        "/two-factor-auth/remove",
        ValidatorContext<typeof remove2FASchemaValidator>
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
    await updateEncryptedTwoFactorAuthKeyService(user.id, null);
    await updateEncryptedTwoFactorAuthRecoveryCodeService(user.id, null);
    return c.json({
        data: "success",
        error: null as ErrorType
    }, 200);
}
