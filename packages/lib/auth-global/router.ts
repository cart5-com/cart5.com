import { Hono } from 'hono';
import type { HonoVariables } from "../hono/HonoVariables";
import { logoutRoute } from './logout';
import { whoamiRoute } from './whoami';
import { callbackRoute } from './cross-domain-callback';
import { callbackSchemaValidator } from './cross-domain-callback';

export const authGlobalRoute = new Hono<HonoVariables>()
    .post(
        '/logout',
        logoutRoute
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





