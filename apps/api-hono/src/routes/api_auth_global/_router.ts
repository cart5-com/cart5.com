import { Hono } from 'hono';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { logoutRoute } from './logout.controller';
import { whoamiRoute } from './whoami.controller';
import {
    callbackRoute,
    callbackSchemaValidator
} from './cross-domain-callback.controller';
import { logoutAllRoute } from './logout-all.controller';
import { getUserDataRoute, getUserData_SchemaValidator } from './user_data/get_user_data.controller';
import { updateUserDataRoute, updateUserData_SchemaValidator } from './user_data/update_user_data.controller';
import { phoneRoute } from './phone/_router';

export const apiAuthGlobal = new Hono<HonoVariables>()
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
        getUserData_SchemaValidator,
        getUserDataRoute
    )
    .patch(
        '/update_user_data',
        updateUserData_SchemaValidator,
        updateUserDataRoute
    )
    .route('/phone', phoneRoute)



export type ApiAuthGlobalType = typeof apiAuthGlobal;


