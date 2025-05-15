import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { getStoreOrders_Service } from '@db/services/order.service';
import { selectOrderSchema } from "@db/schema/order.schema";

export const getStoreOrders_SchemaValidator = zValidator('json', z.object({
    orderIds: z.array(z.string()),
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectOrderSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    ).optional()
}));

// Controller for getting Store address details
export const getStoreOrders_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/",
    ValidatorContext<typeof getStoreOrders_SchemaValidator>
>) => {
    return c.json({
        data: await getStoreOrders_Service(
            c.req.param('storeId'),
            c.req.valid('json').orderIds,
            c.req.valid('json').columns
        ),
        error: null as ErrorType
    }, 200);
}
