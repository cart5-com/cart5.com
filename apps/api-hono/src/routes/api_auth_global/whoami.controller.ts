import { type Context } from 'hono'
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { type ErrorType } from '@lib/types/errors';
import type { User } from '@lib/types/UserType';

export const whoamiRoute = async (c: Context<HonoVariables>) => {
    const user = c.get("USER");
    return c.json({
        data: user as User | null,
        error: null as ErrorType
    }, 200);
}