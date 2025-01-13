import { Hono } from 'hono'
import type { HonoVariables } from "../index";
import { redirectorRoute, redirectorSchemaValidator } from './redirector';
import { callbackRoute, callbackSchemaValidator } from './callback';


/**
 * Cross domain authentication route handler
import { callbackSchemaValidator } from './callback';
 * Handles authentication across different domains in a secure way
 */
export const crossDomainRoute = new Hono<HonoVariables>()
    .post(
        '/redirector',
        redirectorSchemaValidator,
        redirectorRoute
    )
    .get(
        '/callback',
        callbackSchemaValidator,
        callbackRoute
    )