import { Hono } from 'hono'
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { redirectorRoute, redirectorSchemaValidator } from './redirector.controller';

export const crossDomainRoute = new Hono<HonoVariables>()
    .post(
        '/redirector',
        redirectorSchemaValidator,
        redirectorRoute
    )