import { type Context } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { HonoVariables } from '../../hono/HonoVariables';
import { type ValidatorContext } from '../../hono/types/ValidatorContext';
import { type ErrorType } from '../../types/errors';
import {
    addDomainService,
    removeDomainService,
    setDefaultDomainService
} from '../../db/services/website.service';

// Schema for adding a new domain
export const domainSchemaValidator = zValidator('json',
    z.object({
        hostname: z.string().min(3).max(255)
    })
);

// Schema for setting a default domain
export const defaultDomainSchemaValidator = zValidator('json',
    z.object({
        hostname: z.string().min(3).max(255)
    })
);

// Add a new domain to a website
export const addDomain = async (c: Context<
    HonoVariables,
    '/:websiteId/domain',
    ValidatorContext<typeof domainSchemaValidator>
>) => {
    const websiteId = c.req.param('websiteId');
    const { hostname } = c.req.valid('json');

    try {
        await addDomainService(websiteId, hostname);

        return c.json({
            data: 'success',
            error: null as ErrorType
        }, 200);
    } catch (error) {
        return c.json({
            data: null,
            error: {
                message: error instanceof Error ? error.message : 'Failed to add domain',
                code: 'DOMAIN_ERROR'
            } as ErrorType
        }, 400);
    }
};

// Remove a domain from a website
export const removeDomain = async (c: Context<
    HonoVariables,
    "/:websiteId/domain/:hostname"
>) => {
    const websiteId = c.req.param('websiteId');
    const hostname = c.req.param('hostname');

    try {
        await removeDomainService(websiteId, hostname);

        return c.json({
            data: 'success',
            error: null as ErrorType
        }, 200);
    } catch (error) {
        return c.json({
            data: null,
            error: {
                message: error instanceof Error ? error.message : 'Failed to remove domain',
                code: 'DOMAIN_ERROR'
            } as ErrorType
        }, 400);
    }
};

// Set a domain as the default for a website
export const setDefaultDomain = async (c: Context<
    HonoVariables,
    '/:websiteId/domain/default',
    ValidatorContext<typeof defaultDomainSchemaValidator>
>) => {
    const websiteId = c.req.param('websiteId');
    const { hostname } = c.req.valid('json');

    try {
        await setDefaultDomainService(websiteId, hostname);

        return c.json({
            data: 'success',
            error: null as ErrorType
        }, 200);
    } catch (error) {
        return c.json({
            data: null,
            error: {
                message: error instanceof Error ? error.message : 'Failed to set default domain',
                code: 'DOMAIN_ERROR'
            } as ErrorType
        }, 400);
    }
}; 