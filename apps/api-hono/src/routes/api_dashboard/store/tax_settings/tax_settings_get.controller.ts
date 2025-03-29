import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectStoreTaxSettingsSchema } from "@db/schema/store.schema";
import { getStoreTaxSettings_Service } from "@db/services/store.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";

export const getStoreTaxSettings_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectStoreTaxSettingsSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting store tax settings details
export const getStoreTaxSettings_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/tax_settings",
    ValidatorContext<typeof getStoreTaxSettings_SchemaValidator>
>) => {
    return c.json({
        data: await getStoreTaxSettings_Service(c.req.param('storeId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 