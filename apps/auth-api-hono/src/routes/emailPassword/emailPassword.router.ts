import { Hono } from 'hono'
import type { HonoVariables } from "../../index";
import {
    registerEmailPasswordSchemaValidator,
    registerEmailPasswordRoute,
    verifyEmailPasswordSchemaValidator,
    verifyEmailPasswordRoute,
    loginEmailPasswordSchemaValidator,
    loginEmailPasswordRoute
} from './emailPassword.controller';


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