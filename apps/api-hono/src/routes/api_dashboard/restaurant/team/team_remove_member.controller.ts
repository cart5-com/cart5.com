import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { KNOWN_ERROR } from "@lib/types/errors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getRestaurant_Service } from "@db/services/restaurant.service";
import { getTeam_Service, removeTeamMember_Service } from "@db/services/team.service";

export const removeRestaurantTeamMember_SchemaValidator = zValidator(
    'json',
    z.object({
        memberId: z.string().min(1, { message: 'Member ID is required' })
    })
);

export const removeRestaurantTeamMember_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/team_remove_member",
    ValidatorContext<typeof removeRestaurantTeamMember_SchemaValidator>
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
        restaurant.ownerTeamId,
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