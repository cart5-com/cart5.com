import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ErrorType } from '../../../../types/errors';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { addDomain_Service } from './website.domains.add.service';
import type { hostname_SchemaValidator } from '../website.domains.router';

/**
 * Add a domain to a website
 */
export const addDomain_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/domain/add",
    ValidatorContext<typeof hostname_SchemaValidator>
>) => {
    const websiteId = c.req.param('websiteId');
    const { hostname } = c.req.valid('json');

    return c.json({
        data: await addDomain_Service(websiteId, hostname),
        error: null as ErrorType
    });
}; 