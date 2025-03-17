import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import {
    getWebsiteWithDomains,
    isHostnameRegisteredService,
    addDomainToWebsite_Service
} from "@db/services/website.service";
import { KNOWN_ERROR, type ErrorType } from "@lib/types/errors";
import { getEnvVariable, IS_PROD } from "@lib/utils/getEnvVariable";
import { checkDns } from "@lib/utils/dnsCheck";
import type { Context } from "hono";
import type { hostname_SchemaValidator } from "./domain_set_default.controller";
import { RESERVED_SUBDOMAINS } from "@lib/consts";

export const addDomain_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/domain/add",
    ValidatorContext<typeof hostname_SchemaValidator>
>) => {
    const websiteId = c.req.param('websiteId');
    const { hostname } = c.req.valid('json');

    const PUBLIC_DOMAIN_NAME = getEnvVariable('PUBLIC_DOMAIN_NAME');
    if (IS_PROD) {
        // Check if trying to add a reserved subdomain
        if (hostname.endsWith(`.${PUBLIC_DOMAIN_NAME}`)) {
            const subdomain = hostname.split(`.${PUBLIC_DOMAIN_NAME}`)[0].toLowerCase();
            if (RESERVED_SUBDOMAINS.includes(subdomain)) {
                throw new KNOWN_ERROR('This subdomain is reserved', 'RESERVED_SUBDOMAIN');
            }
        }
    }
    const website = await getWebsiteWithDomains(websiteId);
    if (!website) {
        throw new KNOWN_ERROR('Website not found', 'WEBSITE_NOT_FOUND');
    }

    const isRequestedHostnameSubdomain = hostname.endsWith(`.${PUBLIC_DOMAIN_NAME}`);
    if (isRequestedHostnameSubdomain) {
        const existingSubdomain = website.domains?.find(d =>
            d.hostname.endsWith(`.${PUBLIC_DOMAIN_NAME}`)
        );
        if (existingSubdomain) {
            throw new KNOWN_ERROR('subdomain option already used', 'SUBDOMAIN_ALREADY_USED');
        }
    }
    if (IS_PROD) {
        // Skip DNS check if hostname is a subdomain of PUBLIC_DOMAIN_NAME
        if (!hostname.endsWith(`.${PUBLIC_DOMAIN_NAME}`) && !await checkDns(hostname)) {
            throw new KNOWN_ERROR("Invalid DNS", "INVALID_DNS");
        }
    }

    // Check if the domain already exists
    const isRegistered = await isHostnameRegisteredService(hostname);
    if (isRegistered) {
        throw new KNOWN_ERROR('Domain already exists', 'DOMAIN_ALREADY_EXISTS');
    }

    await addDomainToWebsite_Service(websiteId, website, hostname);

    return c.json({
        data: null,
        // data: await addDomain_Service(websiteId, hostname),
        error: null as ErrorType
    });
}; 