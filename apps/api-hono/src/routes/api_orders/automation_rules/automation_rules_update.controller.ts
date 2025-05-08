import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { type ErrorType } from "@lib/types/errors";
import { updateStoreAutomationRules_Service } from "@db/services/store.service";
import { updateStoreAutomationRulesSchema } from "@db/schema/store.schema";

export const updateStoreAutomationRules_SchemaValidator = zValidator('json',
    updateStoreAutomationRulesSchema.omit({
        // unallowed fields for admins
        storeId: true
    }).partial()
)

export const updateStoreAutomationRules_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/automation_rules/update",
    ValidatorContext<typeof updateStoreAutomationRules_SchemaValidator>
>) => {
    const storeId = c.req.param('storeId');
    const {
        // unallowed fields for admins // double check after validator
        // @ts-ignore
        storeId: _storeId,

        // other fields are allowed for admins
        ...data
    } = c.req.valid('json');

    return c.json({
        data: await updateStoreAutomationRules_Service(storeId, data),
        error: null as ErrorType
    }, 200);

} 