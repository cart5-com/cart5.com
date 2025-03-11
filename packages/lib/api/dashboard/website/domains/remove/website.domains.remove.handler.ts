import { type Context } from 'hono';
import type { HonoVariables } from '../../../../../hono/HonoVariables';
import { type ErrorType } from '../../../../../types/errors';
import { type ValidatorContext } from '../../../../../hono/types/ValidatorContext';
import { removeDomain_Service } from './website.domains.remove.service';
import type { hostname_SchemaValidator } from '../website.domains.router';

/**
 * Remove a domain from a website
 */
export const removeDomain_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/domain/remove",
    ValidatorContext<typeof hostname_SchemaValidator>
>) => {
    const websiteId = c.req.param('websiteId');
    const { hostname } = c.req.valid('json');

    return c.json({
        data: await removeDomain_Service(websiteId, hostname),
        error: null as ErrorType
    });
}; 