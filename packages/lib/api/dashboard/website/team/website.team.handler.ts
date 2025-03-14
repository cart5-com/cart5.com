import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ErrorType } from '../../../../types/errors';
import { getWebsiteTeamMembers_Service } from './website.team.service';

/**
 * Controller for getting website team members
 */
export const getWebsiteTeamMembers_Handler = async (c: Context<HonoVariables>) => {
    const websiteId = c.req.param('websiteId');

    // User ID is already checked in websiteAdminCheck middleware
    const userId = c.get('USER')?.id!;

    return c.json({
        data: await getWebsiteTeamMembers_Service(websiteId, userId),
        error: null as ErrorType
    }, 200);
}; 