import { type Context } from 'hono'
import { type ValidatorContext } from 'lib/types/hono/ValidatorContext';
import { zValidator } from '@hono/zod-validator';
import {
    updateUserNameService
} from '../db/db.user.service';
import { KNOWN_ERROR, type ErrorType } from 'lib/errors';
import { z } from 'zod';
import { validateTurnstile } from 'lib/utils/validateTurnstile';
import { getUserByEmailService } from '../db/db.user.service';
import { getEnvVariable } from 'lib/utils/getEnvVariable';
import type { HonoVariables } from "../index";

export const updateNameSchemaValidator = zValidator('form', z.object({
    newName: z.string().min(1, { message: "Name is required" }),
    turnstile: z.string().min(1, { message: "Verification required" })
}))
export const updateNameRoute = async (c: Context<
    HonoVariables,
    "/update-name",
    ValidatorContext<typeof updateNameSchemaValidator>
>) => {
    const { newName, turnstile } = c.req.valid('form');
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
    await updateUserNameService(user.id, newName);
    return c.json({
        data: "success",
        error: null as ErrorType
    }, 200);
}