import { Hono } from 'hono'
import type { honoTypes } from '../index'
import { deleteSession, deleteAllUserSessions } from '../db/db-actions/deleteSession';
import { SESSION_COOKIE_NAME } from '../consts';
import { deleteCookie } from 'hono/cookie';
import type { ErrorType } from '../errors';

export const userRoute = new Hono<honoTypes>()
    .post(
        '/logout',
        async (c) => {
            const session = c.get('SESSION');
            if (session) {
                await deleteSession(session.id);
                deleteCookie(c, SESSION_COOKIE_NAME);
            }
            return c.json({
                data: "success",
                error: null as ErrorType
            }, 200);
        }
    )
    .post(
        '/logout-all',
        async (c) => {
            const session = c.get('SESSION');
            if (session) {
                await deleteAllUserSessions(session.userId);
                deleteCookie(c, SESSION_COOKIE_NAME);
            }
            return c.json({
                data: "success",
                error: null as ErrorType
            }, 200);
        }
    )
    .post(
        '/whoami',
        async (c) => {
            return c.json({
                data: c.get("USER"),
                error: null as ErrorType
            }, 200);
        }
    )