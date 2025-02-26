import { Hono } from 'hono'
import type { HonoVariables } from "../../hono/HonoVariables";
import { redirectGoogleOAuthSchemaValidator, redirectGoogleOAuthRoute } from './redirect';
import { devAskEmailSchemaValidator, devAskEmailRoute } from './dev-ask-email';
import { simulateGoogleOAuthCallbackSchemaValidator, simulateGoogleOAuthCallbackRoute } from './simulate-google-oauth-callback';
import { callbackGoogleOAuthSchemaValidator, callbackGoogleOAuthRoute } from './callback';

export const googleOAuthRoute = new Hono<HonoVariables>()
    .get(
        '/redirect',
        redirectGoogleOAuthSchemaValidator,
        redirectGoogleOAuthRoute
    )
    .get(
        '/dev-ask-email',
        devAskEmailSchemaValidator,
        devAskEmailRoute
    )
    .get(
        '/simulate-google-oauth-callback',
        simulateGoogleOAuthCallbackSchemaValidator,
        simulateGoogleOAuthCallbackRoute
    )
    .get(
        '/callback',
        callbackGoogleOAuthSchemaValidator,
        callbackGoogleOAuthRoute
    )
