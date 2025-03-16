import { createMiddleware } from "hono/factory";
import type { HonoVariables } from "../types/HonoVariables";
import { KNOWN_ERROR } from "@lib/types/errors";

export const mustHaveUser = createMiddleware<HonoVariables>(async (c, next) => {
    const userId = c.get('USER')?.id;
    if (!userId) {
        throw new KNOWN_ERROR("UNAUTHORIZED", "UNAUTHORIZED");
    }
    await next();
});