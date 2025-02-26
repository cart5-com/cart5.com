import { type Context } from 'hono'
import { SESSION_COOKIE_NAME } from "../../consts/auth-consts";
import { deleteCookie } from 'hono/cookie';
import { type ErrorType } from '../../errors';
import type { HonoVariables } from "../../hono/HonoVariables";
import { deleteAllUserSessionsService } from '../../db/schema/session.service';


export const logoutAllRoute = async (c: Context<HonoVariables>) => {
    const session = c.get('SESSION');
    if (session) {
        await deleteAllUserSessionsService(session.userId);
        deleteCookie(c, SESSION_COOKIE_NAME);
    }
    return c.json({
        data: "success",
        error: null as ErrorType
    }, 200);
}