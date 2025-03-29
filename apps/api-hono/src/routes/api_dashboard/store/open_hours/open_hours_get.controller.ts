import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectStoreOpenHoursSchema } from "@db/schema/store.schema";
import { getStoreOpenHours_Service } from "@db/services/store.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { isOpenNow } from "@lib/utils/isOpenNow";
export const getStoreOpenHours_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectStoreOpenHoursSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting store open hours details
export const getStoreOpenHours_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/open_hours",
    ValidatorContext<typeof getStoreOpenHours_SchemaValidator>
>) => {
    let data = await getStoreOpenHours_Service(c.req.param('storeId'), c.req.valid('json').columns)
    if (data) {
        (data as any).isNowOpenServerTime = isOpenNow(data?.timezone ?? null, data?.defaultOpenHours ?? null);
    }
    return c.json({
        data: data,
        error: null as ErrorType
    }, 200);
} 