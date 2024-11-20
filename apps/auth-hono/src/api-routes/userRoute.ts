import { Hono } from 'hono'
import type { honoTypes } from '../index'
import { deleteSessionTokenCookie, invalidateSession } from '../lib/session'

export const userRoute = new Hono<honoTypes>()
    .get(
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
    .get(
        '/whoami',
        async (c) => {
            return c.json({
                data: c.get('USER')
            }, 200);
        }
    )