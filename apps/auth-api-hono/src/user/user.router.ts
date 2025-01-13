import { Hono } from 'hono'
import type { HonoVariables } from "../index";
import { updateNameRoute } from './user.controller';
import { updateNameSchemaValidator } from './user.controller';
import { updatePasswordRoute } from './user.controller';
import { updatePasswordSchemaValidator } from './user.controller';
import { logoutAllRoute, whoamiRoute } from './user.controller';
import { logoutRoute } from './user.controller';

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