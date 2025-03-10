import { type Context } from 'hono';
import type { HonoVariables } from '../../../hono/HonoVariables';
import { removeDomainService } from '../../../db/services/website.service';
import { KNOWN_ERROR, type ErrorType } from '../../../types/errors';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { type ValidatorContext } from '../../../hono/types/ValidatorContext';

export const removeDomainSchema = z.object({
    hostname: z.string().min(3).max(255),
});

export const removeDomainSchemaValidator = zValidator('json', removeDomainSchema);

/**
 * Remove a domain from a website
 */
export const removeDomain = async (c: Context<
    HonoVariables,
    "/:websiteId/domain/remove",
    ValidatorContext<typeof removeDomainSchemaValidator>
>) => {
    const userId = c.get('USER')?.id;
    const websiteId = c.req.param('websiteId');
    const { hostname } = c.req.valid('json');

    if (!userId || !websiteId) {
        throw new KNOWN_ERROR("Unauthorized", "UNAUTHORIZED");
    }

    return c.json({
        data: await removeDomainService(websiteId, hostname),
        error: null as ErrorType
    });
}; 