import { Hono } from 'hono'
import type { HonoVariables } from "../../hono/HonoVariables";
import { redirectGoogleOAuthSchemaValidator, redirectGoogleOAuthRoute } from './redirect';
import { devAskEmailSchemaValidator, devAskEmailRoute } from './dev-ask-email';
import { simulateGoogleOAuthCallbackSchemaValidator, simulateGoogleOAuthCallbackRoute } from './simulate-google-oauth-callback';
import { callbackGoogleOAuthSchemaValidator, callbackGoogleOAuthRoute } from './callback';
import { authHostnameCheck } from '../authHostnameCheck';
export const googleOAuthRoute = new Hono<HonoVariables>()
    .get(
        '/callback',
        authHostnameCheck,
        callbackGoogleOAuthSchemaValidator,
        callbackGoogleOAuthRoute
    )
    .get(
        '/redirect',
        authHostnameCheck,
        redirectGoogleOAuthSchemaValidator,
        redirectGoogleOAuthRoute
    )
    .get(
        '/dev-ask-email',
        authHostnameCheck,
        devAskEmailSchemaValidator,
        devAskEmailRoute
    )
    .get(
        '/simulate-google-oauth-callback',
        authHostnameCheck,
        simulateGoogleOAuthCallbackSchemaValidator,
        simulateGoogleOAuthCallbackRoute
    )

