import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectRestaurantTaxSettingsSchema } from "@db/schema/restaurant.schema";
import { getRestaurantTaxSettings_Service } from "@db/services/restaurant.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";

export const getRestaurantTaxSettings_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectRestaurantTaxSettingsSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting restaurant tax settings details
export const getRestaurantTaxSettings_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/tax_settings",
    ValidatorContext<typeof getRestaurantTaxSettings_SchemaValidator>
>) => {
    return c.json({
        data: await getRestaurantTaxSettings_Service(c.req.param('restaurantId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 