import { type Context } from 'hono'
import { SESSION_COOKIE_NAME } from "@lib/consts";
import { deleteCookie } from 'hono/cookie';
import { type ErrorType } from '@lib/types/errors';
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { deleteAllUserSessionsService } from '@db/services/session.service';

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