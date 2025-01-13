import { Hono } from 'hono'
import type { HonoVariables } from "../../index";
import {
    redirectGoogleOAuthSchemaValidator,
    redirectGoogleOAuthRoute,
    devAskEmailSchemaValidator,
    devAskEmailRoute,
    simulateGoogleOAuthCallbackSchemaValidator,
    simulateGoogleOAuthCallbackRoute,
    callbackGoogleOAuthSchemaValidator,
    callbackGoogleOAuthRoute
} from './googleOAuth.controller';

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
