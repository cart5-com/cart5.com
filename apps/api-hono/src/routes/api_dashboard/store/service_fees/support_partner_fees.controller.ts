import { getSupportTeamServiceFee_Service } from "@db/services/website.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ErrorType } from "@lib/types/errors";

export const getSupportPartnerServiceFee_Handler = async (c: Context<
    HonoVariables
>) => {
    return c.json({
        data: await getSupportTeamServiceFee_Service(c.req.param('storeId')),
        error: null as ErrorType
    }, 200);
}
