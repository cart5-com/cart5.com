import { KNOWN_ERROR } from "@lib/types/errors";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { Context } from "hono";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { hostname_SchemaValidator } from "./domain_add.controller";
import { deleteDomainFromWebsite_Service, getWebsite_Service } from "@db/services/website.service";
import type { ErrorType } from "@lib/types/errors";

export const removeDomain_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/domain/remove",
    ValidatorContext<typeof hostname_SchemaValidator>
>) => {
    const websiteId = c.req.param('websiteId');
    const { hostname } = c.req.valid('json');

    const website = await getWebsite_Service(websiteId, {
        id: true,
        defaultHostname: true,
    });
    if (!website) {
        throw new KNOWN_ERROR('Website not found', 'WEBSITE_NOT_FOUND');
    }
    return c.json({
        data: await deleteDomainFromWebsite_Service(websiteId, website, hostname),
        error: null as ErrorType
    });
}; 