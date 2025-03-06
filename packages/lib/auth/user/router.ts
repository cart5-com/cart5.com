import { Hono } from 'hono';
import type { HonoVariables } from "../../hono/HonoVariables";
import { logoutRoute } from './logout';
import { logoutAllRoute } from './logout-all';
import { whoamiRoute } from './whoami';
import { updatePasswordRoute, updatePasswordSchemaValidator } from './update-password';
import { updateNameRoute, updateNameSchemaValidator } from './update-name';
import { authHostnameCheck } from '../authHostnameCheck';

export const userRoute = new Hono<HonoVariables>()
    .post(
        '/logout',
        logoutRoute
    )
    .post(
        '/whoami',
        whoamiRoute
    )
    // auth frontend only
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





