import { Hono } from 'hono'
import type { HonoVariables } from "../index";
import { logoutRoute } from './logout';
import { logoutAllRoute } from './logout-all';
import { whoamiRoute } from './whoami';
import { updatePasswordRoute, updatePasswordSchemaValidator } from './update-password';
import { updateNameRoute, updateNameSchemaValidator } from './update-name';

export const userRoute = new Hono<HonoVariables>()
    .post(
        '/logout',
        logoutRoute
    )
    .post(
        '/logout-all',
        logoutAllRoute
    )
    .post(
        '/whoami',
        whoamiRoute
    )
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