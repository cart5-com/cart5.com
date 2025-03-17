import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { selectWebsitesSchema } from "@db/schema/website.schema";
import { getWebsite_Service } from "@db/services/website.service";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";

export const getWebsite_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectWebsitesSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting website details
export const getWebsite_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId",
    ValidatorContext<typeof getWebsite_SchemaValidator>
>) => {
    return c.json({
        data: await getWebsite_Service(c.req.param('websiteId'), c.req.valid('json').columns),
        error: null as ErrorType
    }, 200);
} 