import { Hono } from 'hono';
import type { HonoVariables } from "../../hono/HonoVariables";
import { logoutAllRoute } from './logout-all';
import { updatePasswordRoute, updatePasswordSchemaValidator } from './update-password';
import { updateNameRoute, updateNameSchemaValidator } from './update-name';
import { authHostnameCheck } from '../authHostnameCheck';

export const userRoute = new Hono<HonoVariables>()
    .post(
        '/logout-all',
        authHostnameCheck,
        logoutAllRoute
    )
    .post(
        '/update-password',
        authHostnameCheck,
        updatePasswordSchemaValidator,
        updatePasswordRoute
    )
    .post(
        '/update-name',
        authHostnameCheck,
        updateNameSchemaValidator,
        updateNameRoute
    )





