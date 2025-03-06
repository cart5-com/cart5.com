import { Hono } from 'hono';
import type { HonoVariables } from "../../hono/HonoVariables";
import { logoutAllRoute } from './logout-all';
import { updatePasswordRoute, updatePasswordSchemaValidator } from './update-password';
import { updateNameRoute, updateNameSchemaValidator } from './update-name';

export const userRoute = new Hono<HonoVariables>()
    .post(
        '/logout-all',
        logoutAllRoute
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





