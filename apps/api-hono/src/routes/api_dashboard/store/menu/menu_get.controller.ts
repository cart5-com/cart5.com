import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectStoreMenuSchema } from "@db/schema/store.schema";
import { getStoreMenu_Service } from "@db/services/store.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";

export const getStoreMenu_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectStoreMenuSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting store menu details
export const getStoreMenu_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/menu",
    ValidatorContext<typeof getStoreMenu_SchemaValidator>
>) => {
    return c.json({
        data: await getStoreMenu_Service(c.req.param('storeId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 