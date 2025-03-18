import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { decodeIdToken, Google, OAuth2Tokens } from 'arctic';
import { decryptAndVerifyJwt } from '@api-hono/utils/jwt';
import { GOOGLE_OAUTH_COOKIE_NAME } from '@lib/consts';
import { deleteCookie, getCookie } from 'hono/cookie';
import { KNOWN_ERROR } from '@lib/types/errors';
import { updateUserNameService } from '@db/services/user.service';
import { createUserSessionAndSetCookie } from '@api-hono/utils/createUserSessionAndSetCookie';
import { getEnvVariable } from '@lib/utils/getEnvVariable';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { markEmailAsVerifiedService, upsertUserService } from '@db/services/user.service';
import { updateUserPictureUrlService } from '@db/services/user.service';
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';
import type { GoogleOAuthTokenPayload } from './redirect.controller';
import { ENFORCE_HOSTNAME_CHECKS, IS_CADDY_DEV } from '@lib/utils/enforceHostnameChecks';



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
    if (ENFORCE_HOSTNAME_CHECKS && hostHeader !== `auth.${getEnvVariable('PUBLIC_DOMAIN_NAME')}`) {
        throw new KNOWN_ERROR("Invalid host", "INVALID_HOST");
    }

    const url = new URL(c.req.url);
    // Check if this is the Google OAuth callback request
    const isGoogleCallback = url.pathname === '/auth/google_oauth/callback' &&
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
        IS_CADDY_DEV ? getEnvVariable('GOOGLE_OAUTH_REDIRECT_URI_DEV_CADDY') : getEnvVariable('GOOGLE_OAUTH_REDIRECT_URI')
    );
    let tokens: OAuth2Tokens;
    try {
        tokens = await google.validateAuthorizationCode(code, codeVerifier);
    } catch (e) {
        throw new KNOWN_ERROR("Invalid authorization", "INVALID_AUTHORIZATION");
    }
    return decodeIdToken(tokens.idToken()) as GoogleOAuthClaims;
}

