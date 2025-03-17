import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { Context } from "hono";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import { listDomains_Service, setDefaultDomain_Service } from "@db/services/website.service";
import type { ErrorType } from "@lib/types/errors";
import { KNOWN_ERROR } from "@lib/types/errors";
import { z } from "zod";
import { ENFORCE_HOSTNAME_CHECKS } from "@lib/utils/enforceHostnameChecks";
import { zValidator } from "@hono/zod-validator";

export const hostname_Schema = z.object({
    hostname: ENFORCE_HOSTNAME_CHECKS
        ? z.string()
            .min(3, { message: "Domain name must be at least 3 characters" })
            .max(255, { message: "Domain name must be less than 255 characters" })
            .regex(/^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/, {
                message: "Please enter a valid domain name (e.g. example.com)"
            })
        : z.string()
            .min(3, { message: "Domain name must be at least 3 characters" })
            .max(255, { message: "Domain name must be less than 255 characters" })
});

export const hostname_SchemaValidator = zValidator('json', hostname_Schema);

export const setDefaultDomain_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/domain/set_default",
    ValidatorContext<typeof hostname_SchemaValidator>
>) => {
    const websiteId = c.req.param('websiteId');
    const { hostname } = c.req.valid('json');
    const currentDomainList = await listDomains_Service(websiteId, {
        hostname: true
    });
    if (!currentDomainList) {
        throw new KNOWN_ERROR('Domain not found or does not belong to this website', 'DOMAIN_NOT_FOUND_OR_DOES_NOT_BELONG_TO_THIS_WEBSITE');
    }
    if (!currentDomainList.domains.find(domain => domain.hostname === hostname)) {
        throw new KNOWN_ERROR('Domain not found or does not belong to this website', 'DOMAIN_NOT_FOUND_OR_DOES_NOT_BELONG_TO_THIS_WEBSITE');
    }
    return c.json({
        data: await setDefaultDomain_Service(websiteId, hostname),
        error: null as ErrorType
    });
}; 