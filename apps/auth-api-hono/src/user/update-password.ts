import { type Context } from 'hono'
import { type ValidatorContext } from 'lib/hono/types/ValidatorContext';
import { zValidator } from '@hono/zod-validator';
import {
    updateUserPasswordService
} from '../db/schema/user.service';
import { KNOWN_ERROR, type ErrorType } from 'lib/errors';
import { z } from 'zod';
import { hashPassword, verifyPasswordStrength } from '../utils/password';
import { validateTurnstile } from 'lib/utils/validateTurnstile';
import { getUserByEmailService } from '../db/schema/user.service';
import { getEnvVariable } from 'lib/utils/getEnvVariable';
import type { HonoVariables } from "../index";


export const updatePasswordSchemaValidator = zValidator('form', z.object({
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters" })
        .max(255, { message: "Password must be at most 255 characters" })
        .refine(
            async (password) => {
                return await verifyPasswordStrength(password);
            },
            { message: "Password is too weak or has been compromised" }
        ),
    turnstile: z.string().min(1, { message: "Verification required" })
}))
export const updatePasswordRoute = async (c: Context<
    HonoVariables,
    "/update-password",
    ValidatorContext<typeof updatePasswordSchemaValidator>
>) => {
    const { turnstile, password } = c.req.valid('form');
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
    await updateUserPasswordService(user.id, await hashPassword(password));
    return c.json({
        data: "success",
        error: null as ErrorType
    }, 200);
}