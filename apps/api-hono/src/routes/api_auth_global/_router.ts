import { Hono } from 'hono';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { logoutRoute } from './logout.controller';
import { whoamiRoute } from './whoami.controller';
import {
    callbackRoute,
    callbackSchemaValidator
} from './cross-domain-callback.controller';
import { logoutAllRoute } from './logout-all.controller';

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





