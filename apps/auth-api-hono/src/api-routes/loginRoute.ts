import { Hono } from 'hono'
import type { honoTypes } from '../index'
import { getGoogleOAuthHelper } from "../lib/googleOAuthHelper";
import { generateCodeVerifier, generateState } from "arctic";
import { getEnvironmentVariable, IS_PROD } from 'lib/utils/getEnvironmentVariable';
import { serializeCookie } from 'lib/utils/cookie';
import { decryptAndVerifyJwt, signJwtAndEncrypt } from 'lib/utils/jwt';
import { GOOGLE_OAUTH_STATE_COOKIE_NAME } from '../consts';
import { deleteCookie, getCookie } from 'hono/cookie';
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { decodeIdToken, type OAuth2Tokens } from "arctic";
import { createUser, getUserFromGoogleId } from '../lib/user';
import { createLongLivedSession, setSessionTokenCookie } from '../lib/session';

export const loginRoute = new Hono<honoTypes>()
    .get(
        '/handle-redirect-login-btn',
        zValidator('query', z.object({
            redirect_uri: z.string().min(1)
        })),
        (c) => {
            const { redirect_uri } = c.req.valid('query');
            const referer = c.req.header('referer');
            const refererUrl = new URL(referer!);
            const redirectUrl = new URL(decodeURIComponent(redirect_uri));

            return c.text(`
                handle-redirect-login-btn: 

                ${decodeURIComponent(redirect_uri)}

                refererUrl.host: ${refererUrl.host}

                ${referer}`);
        }
    )
    .get(
        '/google-signin',
        async (c) => {
            const state = generateState();
            const codeVerifier = generateCodeVerifier();
            const googleOAuthHelper = getGoogleOAuthHelper();
            const url = googleOAuthHelper.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]);

            const jwtString = await signJwtAndEncrypt({
                state, codeVerifier,
                exp: Math.floor(Date.now() / 1000) + 600
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
                maxAge: 600
            });
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
            const hostname = c.req.header('Host');
            const jwtString = getCookie(c, GOOGLE_OAUTH_STATE_COOKIE_NAME);
            deleteCookie(c, GOOGLE_OAUTH_STATE_COOKIE_NAME);
            if (!jwtString) {
                return new Response("Please restart the process.", {
                    status: 400
                });
            }
            const { state: storedState, codeVerifier } = await decryptAndVerifyJwt<{ state: string, codeVerifier: string }>(jwtString,
                getEnvironmentVariable("JWT_SECRET"),
                getEnvironmentVariable("ENCRYPTION_KEY")
            );
            const { code, state } = c.req.valid('query');

            if (!storedState || !codeVerifier || !code || !state) {
                // return c.text(`Please restart the process.`, 400);
                // return c.html("<h1>Please restart the process.</h1>", 400);
                return new Response("Please restart the process.", {
                    status: 400
                });
            }
            if (storedState !== state) {
                return new Response("Please restart the process.", {
                    status: 400
                });
            }

            let tokens: OAuth2Tokens;
            try {
                const googleOAuthHelper = getGoogleOAuthHelper();
                tokens = await googleOAuthHelper.validateAuthorizationCode(code, codeVerifier);
            } catch (e) {
                return new Response("Please restart the process.", {
                    status: 400
                });
            }

            const claims = decodeIdToken(tokens.idToken()) as { sub: string, name: string, picture: string, email: string };
            const googleId = claims.sub;
            const name = claims.name;
            const picture = claims.picture;
            const email = claims.email;

            const existingUser = await getUserFromGoogleId(googleId);
            if (existingUser !== null) {
                const { session, cookieValue } = await createLongLivedSession(existingUser.id, hostname!);
                setSessionTokenCookie(c, cookieValue, session.expiresAt);
                return c.redirect("/");
            } else {
                const user = await createUser(googleId, email, name, picture);
                // const sessionToken = generateSessionToken();
                // const session = await createSession(sessionToken, user.id);
                const { session, cookieValue } = await createLongLivedSession(user.id, hostname!);
                setSessionTokenCookie(c, cookieValue, session.expiresAt);
                return c.redirect("/");
            }

        }
    )