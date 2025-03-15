import { type Context } from 'hono';
import type { HonoVariables } from '../../../../hono/HonoVariables';
import { type ValidatorContext } from '../../../../hono/types/ValidatorContext';
import { type ErrorType } from '../../../../types/errors';
import { inviteTeamMember_Service } from './website.team_invite.service';
import { zValidator } from '@hono/zod-validator';


import { z } from 'zod';
import { TEAM_PERMISSIONS } from '../../../../db/schema/team.schema';

/**
 * Schema for validating team invitation requests
 */
export const inviteTeamMember_Schema = z.object({
    email: z.string().email({ message: 'Invalid email format' }),
    permissions: z.array(
        z.enum([
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER,
            TEAM_PERMISSIONS.TEAM_MANAGER,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ])
    ).min(1, { message: 'At least one permission is required' })
});

/**
 * Validator middleware for team invitation requests
 */
export const inviteTeamMember_SchemaValidator = zValidator('json', inviteTeamMember_Schema);

/**
 * Controller for inviting a user to a website's team
 */
export const inviteTeamMember_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/team_invite",
    ValidatorContext<typeof inviteTeamMember_SchemaValidator>
>) => {
    const websiteId = c.req.param('websiteId');

    // User ID is already checked in websiteAdminCheck middleware
    const userId = c.get('USER')?.id!;

    // Schema validation is handled by the zValidator middleware
    const { email, permissions } = c.req.valid('json');
    const host = c.req.header()['host'];
    const invitation = await inviteTeamMember_Service(
        websiteId, userId, email, permissions, host
    );

    return c.json({
        data: invitation,
        error: null as ErrorType
    }, 201);
}; 