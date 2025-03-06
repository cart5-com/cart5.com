
import { type Context } from 'hono'
import { SESSION_COOKIE_NAME } from "../../consts/auth-consts";
import { deleteCookie } from 'hono/cookie';
import { type ErrorType } from '../../types/errors';
import type { HonoVariables } from "../../hono/HonoVariables";
import { deleteSessionService } from '../../db/services/session.service';

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
