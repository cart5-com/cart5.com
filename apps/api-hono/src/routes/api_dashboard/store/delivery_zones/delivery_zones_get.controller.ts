import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectStoreDeliveryZoneMapSchema } from "@db/schema/store.schema";
import { getStoreDeliveryZones_Service } from "@db/services/store.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";

export const getStoreDeliveryZones_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectStoreDeliveryZoneMapSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting store delivery zones details
export const getStoreDeliveryZones_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/delivery_zones",
    ValidatorContext<typeof getStoreDeliveryZones_SchemaValidator>
>) => {
    return c.json({
        data: await getStoreDeliveryZones_Service(c.req.param('storeId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 