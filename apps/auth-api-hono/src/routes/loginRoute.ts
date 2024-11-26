import { Hono } from 'hono'
import type { honoTypes } from '../index'
import { getGoogleOAuthHelper } from "../lib/googleOAuthHelper";
import { getEnvironmentVariable } from 'lib/utils/getEnvironmentVariable';
import { decryptAndVerifyJwt, signJwtAndEncrypt } from 'lib/utils/jwt';
import { validateTurnstile } from 'lib/utils/validateTurnstile';
import { GOOGLE_OAUTH_STATE_COOKIE_NAME } from '../consts';
import { deleteCookie, getCookie } from 'hono/cookie';
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { generateCodeVerifier, generateState, type OAuth2Tokens } from "arctic";
import { handleGoogleCallbackUser } from '../lib/user';
import { createLongLivedSession, createShortLivedSession, setSessionTokenCookie } from '../lib/session';
import { KNOWN_ERROR } from 'lib/errors';
import { createAuthApiClient } from 'lib/apiClients/authApiClient';
import { serializeCookie } from 'lib/utils/cookie';

const publicDomainName = getEnvironmentVariable("PUBLIC_DOMAIN_NAME");

export const loginRoute = new Hono<honoTypes>()
    .use(async (c, next) => {
        // This middleware validates that requests only come from allowed sources:
        // 1. Our own auth domain (auth.example.com)
        // 2. Google's authentication domain (accounts.google.com) 
        // 3. The Google OAuth callback URL with required parameters

        const referer = c.req.header('referer');
        const url = new URL(c.req.url);

        // Check if this is the Google OAuth callback request
        const isGoogleCallback = url.pathname === '/api/login/google-callback' &&
            url.searchParams.has('state') &&
            url.searchParams.has('code') &&
            url.searchParams.has('scope');

        // If this is not the callback URL, validate the referer
        if (!isGoogleCallback && referer) {
            const refererUrl = new URL(referer);

            // Only allow requests from our auth domain or Google's auth domain
            const isAllowedReferer =
                refererUrl.origin === `https://auth.${publicDomainName}` ||
                refererUrl.origin === 'https://accounts.google.com';

            if (!isAllowedReferer) {
                throw new KNOWN_ERROR("UNAUTHORIZED_REF", "UNAUTHORIZED_REF");
            }
        }

        await next();
    })
    .post(
        '/create-short-lived-session',
        // Validate that request body contains a redirectUrl string
        zValidator('json', z.object({
            redirectUrl: z.string().min(1),
            turnstile: z.string().min(1, { message: "Verification required" })
        })),
        async (c) => {
            // Get redirectUrl from validated request body
            const { redirectUrl, turnstile } = c.req.valid('json');
            // get request ip
            await validateTurnstile(turnstile, c.req.header('x-forwarded-for'));
            // Check if user is authenticated
            const user = c.get('USER');
            if (!user) {
                throw new KNOWN_ERROR("UNAUTHORIZED", "UNAUTHORIZED");
            }

            // Parse the redirect URL to get its hostname
            const redirectUrlObj = new URL(redirectUrl);
            // TODO: check it is a known hostname

            const goToUrl = await createShortLivedSessionRedirectUrl(user.id, redirectUrlObj);
            // Return the complete URL that the client should redirect to
            return c.json({
                data: goToUrl.toString(),
                error: null
            }, 200);
        }
    )
    .get(
        '/google-signin',
        zValidator('query', z.object({
            redirect: z.string().min(1)
        })),
        async (c) => {
            const { redirect } = c.req.valid('query');
            // referer is already validated in the middleware
            const { cookie, url } = await createGoogleSigninCookieAndUrl(redirect);
            c.header("Set-Cookie", cookie);
            return c.redirect(url.toString());
        }
    )
    .get(
        '/google-callback',
        zValidator('query', z.object({
            code: z.string().min(1),
            state: z.string().min(1)
        })),
        async (c) => {
            const { code, state: stateParam } = c.req.valid('query');
            const hostname = c.req.header('Host');
            const jwtString = getCookie(c, GOOGLE_OAUTH_STATE_COOKIE_NAME);
            deleteCookie(c, GOOGLE_OAUTH_STATE_COOKIE_NAME);
            const { codeVerifier, redirect } = await checkCallback(jwtString, stateParam, code);
            const user = await handleGoogleCallbackUser(code, codeVerifier);
            const { session, cookieValue } = await createLongLivedSession(user.id, hostname!);
            setSessionTokenCookie(c, cookieValue, session.expiresAt);
            return c.redirect(decodeURIComponent(redirect));
        }
    )



async function checkCallback(jwtString: string | undefined, stateParam: string, code: string) {
    if (!jwtString) {
        throw new KNOWN_ERROR("EXPIRED", "EXPIRED_1");
    }
    const { state, codeVerifier, redirect } = await decryptAndVerifyJwt<{
        state: string,
        codeVerifier: string,
        redirect: string
    }>(jwtString,
        getEnvironmentVariable("JWT_SECRET"),
        getEnvironmentVariable("ENCRYPTION_KEY")
    );
    if (!state || !codeVerifier || !code || !stateParam || !redirect) {
        // return c.text(`Please restart the process.`, 400);
        // return c.html("<h1>Please restart the process.</h1>", 400);
        // return new Response("Please restart the process.", {
        //     status: 400
        // });
        throw new KNOWN_ERROR("EXPIRED", "EXPIRED_2");
    }
    if (state !== stateParam) {
        throw new KNOWN_ERROR("EXPIRED", "EXPIRED_3");
    }
    return { codeVerifier, redirect };
}

async function createShortLivedSessionRedirectUrl(userId: string, redirectUrlObj: URL): Promise<String> {
    // Create a temporary session for this user on the target hostname
    const { cookieValue } = await createShortLivedSession(userId, redirectUrlObj.hostname);

    // Create an encrypted JWT containing the session info
    // JWT expires in 10 minutes (600 seconds)
    const shortLivedSessionJwt = await signJwtAndEncrypt(
        {
            cookieValue,
            hostname: redirectUrlObj.hostname,
            exp: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        },
        getEnvironmentVariable("JWT_SECRET"),
        getEnvironmentVariable("ENCRYPTION_KEY")
    );

    // Build URL for the session handler endpoint
    const authApiClient = createAuthApiClient(`${redirectUrlObj.origin}/__p_auth/`);
    const goToUrl = new URL(authApiClient.api.user['short-lived-session-redirect-handler'].$url());

    // Add session token and final redirect URL as query parameters
    goToUrl.searchParams.set("token", shortLivedSessionJwt);
    goToUrl.searchParams.set("redirectUrl", encodeURIComponent(redirectUrlObj.toString()));

    return goToUrl.toString();
}

const createGoogleSigninCookieAndUrl = async (redirect: string) => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const googleOAuthHelper = getGoogleOAuthHelper();
    const url = googleOAuthHelper.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]);

    const jwtString = await signJwtAndEncrypt({
        state, codeVerifier, redirect,
        exp: Math.floor(Date.now() / 1000) + 600 // 10 minutes
    },
        getEnvironmentVariable("JWT_SECRET"),
        getEnvironmentVariable("ENCRYPTION_KEY")
    );

    const cookie = serializeCookie(GOOGLE_OAUTH_STATE_COOKIE_NAME, jwtString, {
        httpOnly: true,
        path: "/",
        // secure: IS_PROD,
        secure: true, // using https in dev
        sameSite: "lax", // use lax to allow redirects, strict does not allow redirects
        maxAge: 600 // 10 minutes
    });
    return { cookie, url };
}
