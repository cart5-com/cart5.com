import { Hono } from 'hono'
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import {
    loginEmailPasswordSchemaValidator,
    loginEmailPasswordRoute
} from './login.controller';
import {
    registerEmailPasswordSchemaValidator,
    registerEmailPasswordRoute
} from './register.controller';
import {
    verifyEmailPasswordSchemaValidator,
    verifyEmailPasswordRoute
} from './verify.controller';

export const emailPasswordRoute = new Hono<HonoVariables>()
    .post(
        '/register',
        registerEmailPasswordSchemaValidator,
        registerEmailPasswordRoute
    )
    .post(
        '/verify',
        verifyEmailPasswordSchemaValidator,
        verifyEmailPasswordRoute
    )
    .post(
        '/login',
        loginEmailPasswordSchemaValidator,
        loginEmailPasswordRoute
    )