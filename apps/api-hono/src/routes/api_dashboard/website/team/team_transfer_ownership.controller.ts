import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { KNOWN_ERROR } from "@lib/types/errors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getWebsite_Service } from "@db/services/website.service";
import { getTeam_Service, transferTeamOwnership_Service } from "@db/services/team.service";

export const transferTeamOwnership_SchemaValidator = zValidator(
    'json',
    z.object({
        newOwnerId: z.string().min(1, { message: 'New owner ID is required' })
    })
);

export const transferTeamOwnership_Handler = async (c: Context<
    HonoVariables,
    "/:websiteId/team_transfer_ownership",
    ValidatorContext<typeof transferTeamOwnership_SchemaValidator>
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

    // Check if the current user is the owner
    if (team.ownerUserId !== currentUserId) {
        throw new KNOWN_ERROR(
            'Only the team owner can transfer ownership',
            'NOT_TEAM_OWNER'
        );
    }

    const newOwnerId = c.req.valid('json').newOwnerId;

    // Cannot transfer to self
    if (newOwnerId === currentUserId) {
        throw new KNOWN_ERROR(
            'Cannot transfer ownership to yourself',
            'CANNOT_TRANSFER_TO_SELF'
        );
    }

    const result = await transferTeamOwnership_Service(
        website.ownerTeamId,
        currentUserId,
        newOwnerId
    );

    if (!result) {
        throw new KNOWN_ERROR(
            'The new owner must be a member of the team',
            'NEW_OWNER_NOT_TEAM_MEMBER'
        );
    }

    return c.json({
        data: "SUCCESS",
        error: null as ErrorType
    }, 200);
}; 