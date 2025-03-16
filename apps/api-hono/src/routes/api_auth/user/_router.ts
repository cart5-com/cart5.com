import { Hono } from 'hono';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { updatePasswordRoute, updatePasswordSchemaValidator } from './update-password.controller';
import { updateNameRoute, updateNameSchemaValidator } from './update-name.controller';
import { encryptTurnstileRoute } from './encrypt-turnstile.controller';
import { encryptTurnstileSchemaValidator } from './encrypt-turnstile.controller';

export const userRoute = new Hono<HonoVariables>()
    .post(
        '/update-password',
        updatePasswordSchemaValidator,
        updatePasswordRoute
    )
    .post(
        '/update-name',
        updateNameSchemaValidator,
        updateNameRoute
    )
    .post(
        '/encrypt-turnstile',
        encryptTurnstileSchemaValidator,
        encryptTurnstileRoute
    )





