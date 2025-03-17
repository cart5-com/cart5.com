import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { selectWebsiteDomainMapSchema } from "@db/schema/website.schema";
import type { ErrorType } from "@lib/types/errors";
import { listDomains_Service } from "@db/services/website.service";

export const listDomains_SchemaValidator = zValidator('json', z.object({
    columns: z.object(
        Object.fromEntries(
            Object.keys(selectWebsiteDomainMapSchema.shape)
                .map(key => [key, z.boolean().optional()])
        )
    )
}));

// Controller for getting website details
export const listDomains_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId",
    ValidatorContext<typeof listDomains_SchemaValidator>
>) => {
    return c.json({
        data: await listDomains_Service(
            c.req.param('websiteId'),
            c.req.valid('json').columns
        ),
        error: null as ErrorType
    }, 200);
} 