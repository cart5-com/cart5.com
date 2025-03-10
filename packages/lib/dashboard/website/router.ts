import { Hono } from "hono";
import type { HonoVariables } from '../../hono/HonoVariables';
import { type Context, type Next } from 'hono';
import { isUserWebsiteAdminService } from '../../db/services/website.service';
import { KNOWN_ERROR } from '../../types/errors';
import { createWebsite, createWebsiteSchemaValidator } from './create';
import { updateWebsite, updateWebsiteSchemaValidator } from './update';
import { getWebsite, getWebsiteSchemaValidator } from './get';
import { getMyWebsites } from "./mine";

export const websiteRouter = new Hono<HonoVariables>()
    .get(
        '/mine',
        getMyWebsites
    )
    .post('/create',
        createWebsiteSchemaValidator,
        createWebsite
    )
    .patch('/:websiteId',
        websiteRouteAdminCheck,
        updateWebsiteSchemaValidator,
        updateWebsite
    )
    .post(
        '/:websiteId',
        websiteRouteAdminCheck,
        getWebsiteSchemaValidator,
        getWebsite
    )


async function websiteRouteAdminCheck(c: Context, next: Next) {
    const userId = c.get('USER')?.id;
    const websiteId = c.req.param('websiteId');
    if (!userId || !websiteId) {
        throw new KNOWN_ERROR("Unauthorized", "UNAUTHORIZED");
    }
    const isAdmin = await isUserWebsiteAdminService(userId, websiteId);
    if (!isAdmin) {
        throw new KNOWN_ERROR("Not admin", "UNAUTHORIZED");
    }
    await next();
} 