import { type Context } from 'hono';
import type { HonoVariables } from '../hono/HonoVariables';
import { getEnvVariable } from '../utils/getEnvVariable';
import db from '../db/drizzle';
import { eq } from 'drizzle-orm';
import { websiteDomainMapTable } from '../db/schema/website.schema';
/**
 * Validates if a domain is registered in our system for Caddy's on_demand_tls
 * 
 * This endpoint is called by Caddy when a new domain requests a TLS certificate
 * Returns 200 if the domain is valid, 404 if not
 */
export const validateDomainForTLS = async (c: Context<HonoVariables>) => {
    // Extract domain from query parameters
    const domain = c.req.query('domain');

    if (!domain) {
        // No domain provided
        return c.text('Domain parameter is required', 400);
    }

    if (
        domain === `auth.${getEnvVariable('PUBLIC_DOMAIN_NAME')}` ||
        domain === `www.${getEnvVariable('PUBLIC_DOMAIN_NAME')}` ||
        domain === getEnvVariable('PUBLIC_DOMAIN_NAME')
    ) {
        return c.text('Domain is valid', 200);
    }

    try {
        // Check if the domain is registered in our system
        const isRegistered = await isHostnameRegisteredService(domain);

        if (isRegistered) {
            // Domain is registered, allow TLS certificate issuance
            return c.text('Domain is valid registered', 200);
        } else {
            // Domain is not registered, reject TLS certificate issuance
            return c.text('Domain not found, not registered', 404);
        }
    } catch (error) {
        console.error('Error validating domain for TLS:', error);
        return c.text('Internal server error', 500);
    }
};

export const isHostnameRegisteredService = async (hostname: string): Promise<boolean> => {
    const existingDomain = await db.query.websiteDomainMapTable.findFirst({
        where: eq(websiteDomainMapTable.hostname, hostname),
        columns: { hostname: true }
    });

    return !!existingDomain;
};
