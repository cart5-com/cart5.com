import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectStoreSchema } from "@db/schema/store.schema";
import { getStore_Service } from "@db/services/store.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";

export const getStore_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectStoreSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting store details
export const getStore_Handler = async (c: Context<
    HonoVariables,
    "/:storeId",
    ValidatorContext<typeof getStore_SchemaValidator>
>) => {
    return c.json({
        data: await getStore_Service(c.req.param('storeId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
}
