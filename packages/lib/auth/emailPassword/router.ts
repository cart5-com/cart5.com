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
import { authHostnameCheck } from '../authHostnameCheck';

export const emailPasswordRoute = new Hono<HonoVariables>()
    .post(
        '/register',
        authHostnameCheck,
        registerEmailPasswordSchemaValidator,
        registerEmailPasswordRoute
    )
    .post(
        '/verify',
        authHostnameCheck,
        verifyEmailPasswordSchemaValidator,
        verifyEmailPasswordRoute
    )
    .post(
        '/login',
        authHostnameCheck,
        loginEmailPasswordSchemaValidator,
        loginEmailPasswordRoute
    )