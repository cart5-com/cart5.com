import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectStoreAddressSchema } from "@db/schema/store.schema";
import { getStoreAddress_Service } from "@db/services/store.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";

export const getStoreAddress_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectStoreAddressSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting Store address details
export const getStoreAddress_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/address",
    ValidatorContext<typeof getStoreAddress_SchemaValidator>
>) => {
    return c.json({
        data: await getStoreAddress_Service(c.req.param('storeId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
}
