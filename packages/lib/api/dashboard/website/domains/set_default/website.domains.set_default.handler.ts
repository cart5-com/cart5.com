import { type Context } from 'hono';
import type { HonoVariables } from '../../../../../hono/HonoVariables';
import { type ErrorType } from '../../../../../types/errors';
import { setDefaultDomain_Service } from './website.domains.set_default.service';
import type { hostname_SchemaValidator } from '../website.domains.router';
import { type ValidatorContext } from '../../../../../hono/types/ValidatorContext';

/**
 * Remove a domain from a website
 */
export const setDefaultDomain_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/domain/set_default",
    ValidatorContext<typeof hostname_SchemaValidator>
>) => {
    const websiteId = c.req.param('websiteId');
    const { hostname } = c.req.valid('json');

    return c.json({
        data: await setDefaultDomain_Service(websiteId, hostname),
        error: null as ErrorType
    });
}; 