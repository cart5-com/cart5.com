import { type Context } from 'hono';
import type { HonoVariables } from '../../hono/HonoVariables';
import { isHostnameRegisteredService } from '../../db/services/website.service';

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
    // www.cart5.com and cart5.com should return 200
    if (domain === 'www.cart5.com' || domain === 'cart5.com') {
        return c.text('Domain is valid', 200);
    }

    try {
        // Check if the domain is registered in our system
        const isRegistered = await isHostnameRegisteredService(domain);

        if (isRegistered) {
            // Domain is registered, allow TLS certificate issuance
            return c.text('Domain is valid', 200);
        } else {
            // Domain is not registered, reject TLS certificate issuance
            return c.text('Domain not found', 404);
        }
    } catch (error) {
        console.error('Error validating domain for TLS:', error);
        return c.text('Internal server error', 500);
    }
}; 