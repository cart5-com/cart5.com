import { type Context } from 'hono';
import type { HonoVariables } from '../../../hono/HonoVariables';
import { addDomainService } from '../../../db/services/website.service';
import { type ErrorType } from '../../../types/errors';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { type ValidatorContext } from '../../../hono/types/ValidatorContext';
import { ENFORCE_HOSTNAME_CHECKS } from '../../../auth/enforceHostnameChecks';

export const addDomainSchema = z.object({
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

export const addDomainSchemaValidator = zValidator('json', addDomainSchema);

/**
 * Add a domain to a website
 */
export const addDomain = async (c: Context<
    HonoVariables,
    "/:websiteId/domain/add",
    ValidatorContext<typeof addDomainSchemaValidator>
>) => {
    const websiteId = c.req.param('websiteId');
    const { hostname } = c.req.valid('json');

    return c.json({
        data: await addDomainService(websiteId, hostname),
        error: null as ErrorType
    });
}; 