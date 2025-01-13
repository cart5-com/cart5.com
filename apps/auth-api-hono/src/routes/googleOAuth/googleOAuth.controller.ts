import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { decodeIdToken, generateCodeVerifier, generateState, Google, OAuth2Tokens } from 'arctic';
import { decryptAndVerifyJwt, signJwtAndEncrypt } from '../../utils/jwt';
import { GOOGLE_OAUTH_COOKIE_NAME } from 'lib/auth-consts';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { KNOWN_ERROR } from 'lib/errors';
import { updateUserNameService } from '../user/user.service';
import { createUserSessionAndSetCookie } from '../session/session.controller';
import { getEnvVariable, IS_PROD } from 'lib/utils/getEnvVariable';
import { ENFORCE_HOSTNAME_CHECKS } from '../../enforceHostnameChecks';
import type { HonoVariables } from "../../index";
import { markEmailAsVerifiedService, upsertUserService } from '../user/user.service';
import { updateUserPictureUrlService } from '../user/user.service';
import type { ValidatorContext } from 'lib/types/hono/ValidatorContext';




export const redirectGoogleOAuthSchemaValidator = zValidator('query', z.object({
    redirect_uri: z.string().min(1),
}));
export const redirectGoogleOAuthRoute = async (
    c: Context<
        HonoVariables,
        "/otp/verify",
        ValidatorContext<typeof redirectGoogleOAuthSchemaValidator>
    >
) => {
    const { redirect_uri } = c.req.valid('query');

    let hasRequiredEnvVariables = false;
    try {
        hasRequiredEnvVariables = !!(
            getEnvVariable('GOOGLE_OAUTH_CLIENT_ID') &&
            getEnvVariable('GOOGLE_OAUTH_CLIENT_SECRET') &&
            getEnvVariable('GOOGLE_OAUTH_REDIRECT_URI')
        );
    } catch (e) {
        hasRequiredEnvVariables = false;
    }

    if (
        hasRequiredEnvVariables
    ) {
        const hostHeader = c.req.header()['host'];
        if (!hostHeader) {
            throw new KNOWN_ERROR("Host header not found", "HOST_HEADER_NOT_FOUND");
        }

        if (hostHeader !== `auth.${getEnvVariable('PUBLIC_DOMAIN_NAME')}`) {
            throw new KNOWN_ERROR("Invalid host", "INVALID_HOST");
        }

        const { url, state: storedState, codeVerifier: storedCodeVerifier } = await getSignInUrl();
        const google_oauth_token = await signJwtAndEncrypt<GoogleOAuthTokenPayload>(
            getEnvVariable('JWT_PRIVATE_KEY'),
            getEnvVariable('ENCRYPTION_KEY'),
            {
                storedState,
                storedCodeVerifier,
                redirect_uri: decodeURIComponent(redirect_uri)
            }
        );

        setCookie(c, GOOGLE_OAUTH_COOKIE_NAME, google_oauth_token, {
            path: "/",
            secure: ENFORCE_HOSTNAME_CHECKS,
            httpOnly: true,
            maxAge: 600, // 10 minutes
            sameSite: "lax" // must use lax to read cookie value after google's redirect
            // strict does not allow reading the cookie value after redirect
        });

        return c.redirect(url.toString());
    } else if (!IS_PROD) {
        // simulate a redirect to the google oauth page
        return c.redirect(`/__p_auth/api/google_oauth/dev-ask-email?redirect_uri=${redirect_uri}`);
    } else {
        throw new KNOWN_ERROR("Google OAuth credentials not found", "GOOGLE_OAUTH_CREDENTIALS_NOT_FOUND");
    }
}






export const devAskEmailSchemaValidator = zValidator('query', z.object({
    redirect_uri: z.string().min(1),
}));
export const devAskEmailRoute = async (
    c: Context<
        HonoVariables,
        "/otp/verify",
        ValidatorContext<typeof devAskEmailSchemaValidator>
    >
) => {
    if (IS_PROD) {
        return c.text('not allowed in prod');
    } else {
        const { redirect_uri } = c.req.valid('query');
        return c.html(`<html>
                    <head>
                        <title>simulate Google OAuth dev</title>
                    </head>
                    <body>
                        <form action="/__p_auth/api/google_oauth/simulate-google-oauth-callback" method="get">
                            <label for="email">Email:</label>
                        <br />
                        <input type="text" id="email" name="email" placeholder="email" />
                        <br />
                        <br />
                        <!-- <label for="redirect_uri">Redirect URI:</label> -->
                        <br />
                        <input type="hidden" id="redirect_uri" name="redirect_uri" placeholder="redirect_uri" value="${redirect_uri}" />
                        <br />
                        <br />
                        <button type="submit">submit</button>
                    </form>
                </body>
                </html>`);
    }
}






export const simulateGoogleOAuthCallbackSchemaValidator = zValidator('query', z.object({
    email: z.string().email(),
    redirect_uri: z.string().min(1)
}))
export const simulateGoogleOAuthCallbackRoute = async (
    c: Context<
        HonoVariables,
        "/otp/verify",
        ValidatorContext<typeof simulateGoogleOAuthCallbackSchemaValidator>
    >
) => {
    if (IS_PROD) {
        return c.text('not allowed in prod');
    } else {
        const { email, redirect_uri } = c.req.valid('query');
        const user = await upsertUserService(email);
        // if email is not verified, mark it as verified
        if (!user.isEmailVerified) {
            await markEmailAsVerifiedService(email);
        }
        await createUserSessionAndSetCookie(c, user.id);
        return c.redirect(decodeURIComponent(redirect_uri));
    }
}


export const callbackGoogleOAuthSchemaValidator = zValidator('query', z.object({
    code: z.string().min(1),
    state: z.string().min(1)
}))
export const callbackGoogleOAuthRoute = async (
    c: Context<
        HonoVariables,
        "/otp/verify",
        ValidatorContext<typeof callbackGoogleOAuthSchemaValidator>
    >
) => {
    const { code, state } = c.req.valid('query');
    const google_oauth_token = getCookie(c, GOOGLE_OAUTH_COOKIE_NAME);
    if (!google_oauth_token) {
        throw new KNOWN_ERROR("No google oauth token", "NO_GOOGLE_OAUTH_TOKEN");
    }
    deleteCookie(c, GOOGLE_OAUTH_COOKIE_NAME);

    const hostHeader = c.req.header()['host'];
    if (!hostHeader) {
        throw new KNOWN_ERROR("Host header not found", "HOST_HEADER_NOT_FOUND");
    }
    if (hostHeader !== `auth.${getEnvVariable('PUBLIC_DOMAIN_NAME')}`) {
        throw new KNOWN_ERROR("Invalid host", "INVALID_HOST");
    }

    const url = new URL(c.req.url);
    // Check if this is the Google OAuth callback request
    const isGoogleCallback = url.pathname === '/api/google_oauth/callback' &&
        url.searchParams.has('state') &&
        url.searchParams.has('code') &&
        url.searchParams.has('scope');
    if (!isGoogleCallback) {
        throw new KNOWN_ERROR("Invalid request", "INVALID_REQUEST");
    }


    const { storedState, storedCodeVerifier, redirect_uri } = await decryptAndVerifyJwt<GoogleOAuthTokenPayload>(
        getEnvVariable('JWT_PRIVATE_KEY'),
        getEnvVariable('ENCRYPTION_KEY'),
        google_oauth_token
    );
    if (!storedState || !storedCodeVerifier || !redirect_uri) {
        throw new KNOWN_ERROR("Expired or invalid", "EXPIRED_OR_INVALID_GOOGLE_OAUTH_TOKEN");
    }
    if (storedState !== state) {
        throw new KNOWN_ERROR("Invalid state", "INVALID_STATE");
    }

    const googleOAuthUser = await validateAuthorizationCode(code, storedCodeVerifier);

    const user = await upsertUserService(googleOAuthUser.email);
    // if email is not verified, mark it as verified
    if (!user.isEmailVerified) {
        await markEmailAsVerifiedService(googleOAuthUser.email);
    }
    // update name only if it is null
    if (user.name === null && googleOAuthUser.name) {
        await updateUserNameService(user.id, googleOAuthUser.name);
    }
    // update picture only if it is different
    if (googleOAuthUser.picture && googleOAuthUser.picture !== user.pictureUrl) {
        await updateUserPictureUrlService(user.id, googleOAuthUser.picture);
    }

    await createUserSessionAndSetCookie(c, user.id);

    return c.redirect(redirect_uri.toString());
}

type GoogleOAuthTokenPayload = {
    storedState: string;
    storedCodeVerifier: string;
    redirect_uri: string;
}

type GoogleOAuthClaims = {
    at_hash: string;
    aud: string;
    azp: string;
    email: string;
    email_verified: boolean;
    exp: number;
    family_name: string;
    given_name: string;
    iat: number;
    iss: string;
    name: string;
    picture: string;
    sub: string;
}

async function validateAuthorizationCode(
    code: string,
    codeVerifier: string
) {
    const google = new Google(
        getEnvVariable('GOOGLE_OAUTH_CLIENT_ID'),
        getEnvVariable('GOOGLE_OAUTH_CLIENT_SECRET'),
        getEnvVariable('GOOGLE_OAUTH_REDIRECT_URI')
    );
    let tokens: OAuth2Tokens;
    try {
        tokens = await google.validateAuthorizationCode(code, codeVerifier);
    } catch (e) {
        throw new KNOWN_ERROR("Invalid authorization", "INVALID_AUTHORIZATION");
    }
    return decodeIdToken(tokens.idToken()) as GoogleOAuthClaims;
}

async function getSignInUrl() {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const google = new Google(
        getEnvVariable('GOOGLE_OAUTH_CLIENT_ID'),
        getEnvVariable('GOOGLE_OAUTH_CLIENT_SECRET'),
        getEnvVariable('GOOGLE_OAUTH_REDIRECT_URI')
    );
    const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]);
    return { url, state, codeVerifier };
}