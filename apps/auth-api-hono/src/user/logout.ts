
import { type Context } from 'hono'
import { SESSION_COOKIE_NAME } from "lib/auth-consts";
import { deleteCookie } from 'hono/cookie';
import { type ErrorType } from 'lib/errors';
import type { HonoVariables } from "../index";
import { deleteSessionService } from '../db/db.session';

export const logoutRoute = async (c: Context<HonoVariables>) => {
    const session = c.get('SESSION');
    if (session) {
        await deleteSessionService(session.id);
        deleteCookie(c, SESSION_COOKIE_NAME);
    }
    return c.json({
        data: "success",
        error: null as ErrorType
    }, 200);
}
