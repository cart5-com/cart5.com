import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { KNOWN_ERROR } from "@lib/types/errors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getStore_Service } from "@db/services/store.service";
import { getTeam_Service, transferTeamOwnership_Service } from "@db/services/team.service";

export const transferStoreTeamOwnership_SchemaValidator = zValidator(
    'json',
    z.object({
        newOwnerId: z.string().min(1, { message: 'New owner ID is required' })
    })
);

export const transferStoreTeamOwnership_Handler = async (c: Context<
    HonoVariables,
    "/:storeId/team_transfer_ownership",
    ValidatorContext<typeof transferStoreTeamOwnership_SchemaValidator>
>) => {
    const store = await getStore_Service(c.req.param('storeId'), {
        ownerTeamId: true
    });

    if (!store) {
        throw new KNOWN_ERROR(
            'Store not found',
            'STORE_NOT_FOUND'
        );
    }

    const team = await getTeam_Service(store.ownerTeamId, {
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
        store.ownerTeamId,
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