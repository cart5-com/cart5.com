import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import { type ErrorType } from "@lib/types/errors";
import { getWebsiteInfo_Service } from "@db/services/website.service";

export const getWebsiteInfo_Handler = async (c: Context<
    HonoVariables
>) => {
    return c.json({
        data: await getWebsiteInfo_Service(c.req.header()['host']),
        error: null as ErrorType
    }, 200);
}