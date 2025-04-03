import { Hono } from 'hono';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { logoutRoute } from './logout.controller';
import { whoamiRoute } from './whoami.controller';
import {
    callbackRoute,
    callbackSchemaValidator
} from './cross-domain-callback.controller';
import { logoutAllRoute } from './logout-all.controller';
import { getUserDataRoute, getUserDataSchemaValidator } from './get_user_data.controller';
import { updateUserDataRoute, updateUserDataSchemaValidator } from './update_user_data.controller';

export const authGlobalRoute = new Hono<HonoVariables>()
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
    .get(
        '/cross-domain-callback',
        callbackSchemaValidator,
        callbackRoute
    )
    .post(
        '/get_user_data',
        getUserDataSchemaValidator,
        getUserDataRoute
    )
    .patch(
        '/update_user_data',
        updateUserDataSchemaValidator,
        updateUserDataRoute
    )





