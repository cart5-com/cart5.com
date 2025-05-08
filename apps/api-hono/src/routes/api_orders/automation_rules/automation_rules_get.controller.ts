import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectStoreAutomationRulesSchema } from "@db/schema/store.schema";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { getStoreAutomationRules_Service } from "@db/services/store.service";

export const getAutomationRules_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectStoreAutomationRulesSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

export const getAutomationRules_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/automation_rules/get",
    ValidatorContext<typeof getAutomationRules_SchemaValidator>
>) => {
    return c.json({
        data: await getStoreAutomationRules_Service(c.req.param('storeId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 