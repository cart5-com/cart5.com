import { type Context } from 'hono';
import type { HonoVariables } from '../../../hono/HonoVariables';
import { setDefaultDomainService } from '../../../db/services/website.service';
import { KNOWN_ERROR, type ErrorType } from '../../../types/errors';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { type ValidatorContext } from '../../../hono/types/ValidatorContext';

export const setDefaultDomainSchema = z.object({
    hostname: z.string().min(3).max(255),
});

export const setDefaultDomainSchemaValidator = zValidator('json', setDefaultDomainSchema);

/**
 * Set a domain as the default for a website
 */
export const setDefaultDomain = async (c: Context<
    HonoVariables,
    "/:websiteId/domain/set-default",
    ValidatorContext<typeof setDefaultDomainSchemaValidator>
>) => {
    const userId = c.get('USER')?.id;
    const websiteId = c.req.param('websiteId');
    const { hostname } = c.req.valid('json');

    if (!userId || !websiteId) {
        throw new KNOWN_ERROR("Unauthorized", "UNAUTHORIZED");
    }

    return c.json({
        data: await setDefaultDomainService(websiteId, hostname),
        error: null as ErrorType
    });
}; 