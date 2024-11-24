import { Hono } from 'hono'
import type { honoTypes } from '../index'
import {
    createLongLivedSession,
    deleteSessionTokenCookie,
    invalidateSession,
    invalidateSessionByCookieValue,
    setSessionTokenCookie,
    validateSessionToken
} from '../lib/session'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { decryptAndVerifyJwt } from 'lib/utils/jwt';
import { getEnvironmentVariable } from 'lib/utils/getEnvironmentVariable';

export const userRoute = new Hono<honoTypes>()
    .get(
        '/short-lived-session-redirect-handler',
        zValidator('query', z.object({
            token: z.string(),
            redirectUrl: z.string()
        })),
        async (c) => {
            const { token, redirectUrl } = c.req.valid('query');
            const decodedRedirectUrl = decodeURIComponent(redirectUrl);
            // Only allow requests comes from our auth domain
            if (c.req.header('Referer') !== `https://auth.${getEnvironmentVariable("PUBLIC_DOMAIN_NAME")}/`) {
                return c.redirect(decodedRedirectUrl);
            }
            const reqHostname = c.req.header('Host');
            const { cookieValue, hostname } = await decryptAndVerifyJwt<{ cookieValue: string, hostname: string }>(
                token,
                getEnvironmentVariable("JWT_SECRET"),
                getEnvironmentVariable("ENCRYPTION_KEY")
            );
            if (hostname !== reqHostname) {
                return c.redirect(decodedRedirectUrl);
            }
            // TODO: check it is a known hostname
            const { user, session } = await validateSessionToken(cookieValue, hostname!, false);
            await invalidateSessionByCookieValue(cookieValue);
            if (session && user) {
                const { session: newSession, cookieValue: newCookieValue } = await createLongLivedSession(user.id, hostname!);
                setSessionTokenCookie(c, newCookieValue, newSession.expiresAt);
            }
            return c.redirect(decodedRedirectUrl);
        }
    )
    .post(
        '/logout',
        async (c) => {
            const session = c.get('SESSION');
            if (session) {
                await invalidateSession(session.id);
                deleteSessionTokenCookie(c);
            }
            return c.redirect('/');
        }
    )
    .post(
        '/whoami',
        async (c) => {
            return c.json({
                data: c.get('USER'),
                error: null
            }, 200);
        }
    )