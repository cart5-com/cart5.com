import { zValidator } from "@hono/zod-validator";
import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { type ErrorType } from "@lib/types/errors";
import { updateWebsite_Service } from "@db/services/website.service";
import { updateWebsitesSchema } from "@db/schema/website.schema";

// Schema validation for updating website
export const updateWebsite_SchemaValidator = zValidator('json',
    updateWebsitesSchema.omit({
        // unallowed fields for admins
        id: true,
        defaultHostname: true,
        created_at_ts: true,
        updated_at_ts: true,
        ownerTeamId: true,
        supportTeamId: true,
        isPartner: true,
    }).partial()
)
// Controller for updating website
export const updateWebsite_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId",
    ValidatorContext<typeof updateWebsite_SchemaValidator>
>) => {

    const websiteId = c.req.param('websiteId');
    const {
        // unallowed fields for admins // double check after validator
        // @ts-ignore
        id, created_at_ts, updated_at_ts, defaultHostname, ownerTeamId, supportTeamId, isPartner,

        // other fields are allowed for admins
        ...data
    } = c.req.valid('json');

    return c.json({
        data: await updateWebsite_Service(websiteId, data),
        error: null as ErrorType
    }, 200);
} 