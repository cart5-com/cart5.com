import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { signJwtAndEncrypt } from '@api-hono/utils/jwt';
import { GOOGLE_OAUTH_COOKIE_NAME } from '@lib/consts';
import { setCookie } from 'hono/cookie';
import { KNOWN_ERROR } from '@lib/types/errors';
import { getEnvVariable, IS_PROD } from '@lib/utils/getEnvVariable';
import { ENFORCE_HOSTNAME_CHECKS, IS_CADDY_DEV } from '@lib/utils/enforceHostnameChecks';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from '@api-hono/types/ValidatorContext';
import { generateCodeVerifier, generateState, Google } from 'arctic';

export const redirectGoogleOAuthSchemaValidator = zValidator('query', z.object({
    redirect_uri: z.string().min(1),
}));
export const redirectGoogleOAuthRoute = async (
    c: Context<
        HonoVariables,
        "/redirect",
        ValidatorContext<typeof redirectGoogleOAuthSchemaValidator>
    >
) => {
    const { redirect_uri } = c.req.valid('query');

    let hasRequiredEnvVariables = false;
    try {
        hasRequiredEnvVariables = !!(
            getEnvVariable('GOOGLE_OAUTH_CLIENT_ID') &&
            getEnvVariable('GOOGLE_OAUTH_CLIENT_SECRET') &&
            (IS_CADDY_DEV ? getEnvVariable('GOOGLE_OAUTH_REDIRECT_URI_DEV_CADDY') : getEnvVariable('GOOGLE_OAUTH_REDIRECT_URI'))
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

        if (ENFORCE_HOSTNAME_CHECKS && hostHeader !== `auth.${getEnvVariable('PUBLIC_DOMAIN_NAME')}`) {
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
        return c.redirect(`/__p_api/api_auth/google_oauth/dev-ask-email?redirect_uri=${redirect_uri}`);
    } else {
        throw new KNOWN_ERROR("Google OAuth credentials not found", "GOOGLE_OAUTH_CREDENTIALS_NOT_FOUND");
    }
}


export type GoogleOAuthTokenPayload = {
    storedState: string;
    storedCodeVerifier: string;
    redirect_uri: string;
}

async function getSignInUrl() {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const google = new Google(
        getEnvVariable('GOOGLE_OAUTH_CLIENT_ID'),
        getEnvVariable('GOOGLE_OAUTH_CLIENT_SECRET'),
        IS_CADDY_DEV ? getEnvVariable('GOOGLE_OAUTH_REDIRECT_URI_DEV_CADDY') : getEnvVariable('GOOGLE_OAUTH_REDIRECT_URI')
    );
    const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]);
    return { url, state, codeVerifier };
}