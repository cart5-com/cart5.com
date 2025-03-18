import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { KNOWN_ERROR } from "@lib/types/errors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getWebsite_Service } from "@db/services/website.service";
import { getTeam_Service, removeTeamMember_Service } from "@db/services/team.service";

export const removeTeamMember_SchemaValidator = zValidator(
    'json',
    z.object({
        memberId: z.string().min(1, { message: 'Member ID is required' })
    })
);

export const removeTeamMember_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/team_remove_member",
    ValidatorContext<typeof removeTeamMember_SchemaValidator>
>) => {
    const website = await getWebsite_Service(c.req.param('websiteId'), {
        ownerTeamId: true
    });

    if (!website) {
        throw new KNOWN_ERROR(
            'Website not found',
            'WEBSITE_NOT_FOUND'
        );
    }

    const team = await getTeam_Service(website.ownerTeamId, {
        ownerUserId: true
    });

    if (!team) {
        throw new KNOWN_ERROR(
            'Team not found',
            'TEAM_NOT_FOUND'
        );
    }

    const currentUserId = c.get('USER')?.id ?? '';
    const memberId = c.req.valid('json').memberId;

    // Cannot remove yourself
    if (memberId === currentUserId) {
        throw new KNOWN_ERROR(
            'You cannot remove yourself from the team',
            'CANNOT_REMOVE_SELF'
        );
    }

    // Check if attempting to remove the owner
    if (memberId === team.ownerUserId) {
        throw new KNOWN_ERROR(
            'The team owner cannot be removed. Transfer ownership first.',
            'CANNOT_REMOVE_OWNER'
        );
    }

    const result = await removeTeamMember_Service(
        website.ownerTeamId,
        memberId,
        team.ownerUserId
    );

    if (!result) {
        throw new KNOWN_ERROR(
            'Failed to remove team member',
            'FAILED_TO_REMOVE_MEMBER'
        );
    }

    return c.json({
        data: "SUCCESS",
        error: null as ErrorType
    }, 200);
}; 