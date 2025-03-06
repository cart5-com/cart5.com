import { Hono } from 'hono'
import type { HonoVariables } from "../../hono/HonoVariables";
import { redirectorRoute, redirectorSchemaValidator } from './redirector';
import { authHostnameCheck } from '../authHostnameCheck';

export const crossDomainRoute = new Hono<HonoVariables>()
    .post(
        '/redirector',
        authHostnameCheck,
        redirectorSchemaValidator,
        redirectorRoute
    )