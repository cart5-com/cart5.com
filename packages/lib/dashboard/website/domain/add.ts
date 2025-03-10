import { type Context } from 'hono';
import type { HonoVariables } from '../../../hono/HonoVariables';
import { addDomainService, isHostnameRegisteredService } from '../../../db/services/website.service';
import { KNOWN_ERROR, type ErrorType } from '../../../types/errors';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { type ValidatorContext } from '../../../hono/types/ValidatorContext';
import { checkDns } from '../../../utils/dnsCheck';
import { IS_PROD } from '../../../utils/getEnvVariable';

export const addDomainSchema = z.object({
    hostname: z.string().min(3).max(255),
});

export const addDomainSchemaValidator = zValidator('json', addDomainSchema);

/**
 * Add a domain to a website
 */
export const addDomain = async (c: Context<
    HonoVariables,
    "/:websiteId/domain/add",
    ValidatorContext<typeof addDomainSchemaValidator>
>) => {
    const userId = c.get('USER')?.id;
    const websiteId = c.req.param('websiteId');
    const { hostname } = c.req.valid('json');

    if (!userId || !websiteId) {
        throw new KNOWN_ERROR("Unauthorized", "UNAUTHORIZED");
    }
    // Check if the hostname is already registered
    const isRegistered = await isHostnameRegisteredService(hostname);
    if (isRegistered) {
        throw new KNOWN_ERROR("Domain already taken", "DOMAIN_ALREADY_TAKEN");
    }
    if (IS_PROD) {
        if (!await checkDns(hostname)) {
            throw new KNOWN_ERROR("Invalid DNS", "INVALID_DNS");
        }
    }
    return c.json({
        data: await addDomainService(websiteId, hostname),
        error: null as ErrorType
    });
}; 