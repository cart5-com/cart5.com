import { type Context } from 'hono'
import { type ErrorType } from 'lib/errors';
import type { HonoVariables } from "../index";

export const whoamiRoute = async (c: Context<HonoVariables>) => {
    const user = c.get("USER");
    return c.json({
        data: user,
        error: null as ErrorType
    }, 200);
}