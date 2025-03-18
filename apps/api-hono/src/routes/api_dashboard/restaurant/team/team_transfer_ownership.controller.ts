import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { KNOWN_ERROR } from "@lib/types/errors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getRestaurant_Service } from "@db/services/restaurant.service";
import { getTeam_Service, transferTeamOwnership_Service } from "@db/services/team.service";

export const transferRestaurantTeamOwnership_SchemaValidator = zValidator(
    'json',
    z.object({
        newOwnerId: z.string().min(1, { message: 'New owner ID is required' })
    })
);

export const transferRestaurantTeamOwnership_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/team_transfer_ownership",
    ValidatorContext<typeof transferRestaurantTeamOwnership_SchemaValidator>
>) => {
    const restaurant = await getRestaurant_Service(c.req.param('restaurantId'), {
        ownerTeamId: true
    });

    if (!restaurant) {
        throw new KNOWN_ERROR(
            'Restaurant not found',
            'RESTAURANT_NOT_FOUND'
        );
    }

    const team = await getTeam_Service(restaurant.ownerTeamId, {
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
        restaurant.ownerTeamId,
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