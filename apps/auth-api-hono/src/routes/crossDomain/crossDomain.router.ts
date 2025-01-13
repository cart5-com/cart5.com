import { Hono } from 'hono'
import type { HonoVariables } from "../../index";
import {
    redirectorSchemaValidator,
    redirectorRoute,
    callbackSchemaValidator,
    callbackRoute
} from './crossDomain.controller';


/**
 * Cross domain authentication route handler
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