import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { getAllWebsitesThatUserHasAccessTo } from "@db/services/website.service";
import type { ErrorType } from "@lib/types/errors";
import type { Context } from "hono";

export const getMyWebsites_Handler = async (c: Context<HonoVariables>) => {
    return c.json({
        data: await getAllWebsitesThatUserHasAccessTo(c.get('USER')?.id!),
        error: null as ErrorType
    }, 200);
} 