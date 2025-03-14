import { Hono } from 'hono'
import type { HonoVariables } from "../../hono/HonoVariables";
import {
    loginEmailPasswordSchemaValidator,
    loginEmailPasswordRoute
} from './login';
import {
    registerEmailPasswordSchemaValidator,
    registerEmailPasswordRoute
} from './register';
import {
    verifyEmailPasswordSchemaValidator,
    verifyEmailPasswordRoute
} from './verify';

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