import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectStoreServiceFeesSchema } from "@db/schema/store.schema";
import { getStoreServiceFees_Service } from "@db/services/store.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";

export const getStoreServiceFees_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectStoreServiceFeesSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting store service fees details
export const getStoreServiceFees_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/service_fees",
    ValidatorContext<typeof getStoreServiceFees_SchemaValidator>
>) => {
    return c.json({
        data: await getStoreServiceFees_Service(c.req.param('storeId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
}
