import { Hono } from 'hono'
import type { HonoVariables } from "../../hono/HonoVariables";
import { redirectorRoute, redirectorSchemaValidator } from './redirector';

export const crossDomainRoute = new Hono<HonoVariables>()
    .post(
        '/redirector',
        redirectorSchemaValidator,
        redirectorRoute
    )