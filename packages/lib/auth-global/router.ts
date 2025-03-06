import { Hono } from 'hono';
import type { HonoVariables } from "../hono/HonoVariables";
import { logoutRoute } from './logout';
import { whoamiRoute } from './whoami';

export const authGlobalRoute = new Hono<HonoVariables>()
    .post(
        '/logout',
        logoutRoute
    )
    .post(
        '/whoami',
        whoamiRoute
    )





