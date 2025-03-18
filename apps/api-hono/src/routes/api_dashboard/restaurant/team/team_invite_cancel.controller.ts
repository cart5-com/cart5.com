import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ValidatorContext } from "@api-hono/types/ValidatorContext";
import type { ErrorType } from "@lib/types/errors";
import { KNOWN_ERROR } from "@lib/types/errors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { getRestaurant_Service } from "@db/services/restaurant.service";
import { cancelTeamInvitation_Service } from "@db/services/team.service";

export const cancelRestaurantTeamInvitation_SchemaValidator = zValidator(
    'json',
    z.object({
        invitationId: z.string().min(1, { message: 'Invitation ID is required' })
    })
);

export const cancelRestaurantTeamInvitation_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/team_invite_cancel",
    ValidatorContext<typeof cancelRestaurantTeamInvitation_SchemaValidator>
>) => {
    const restaurant = await getRestaurant_Service(c.req.param('restaurantId'), {
        ownerTeamId: true
    });

    const invitationId = c.req.valid('json').invitationId;

    const result = await cancelTeamInvitation_Service(
        invitationId,
        restaurant?.ownerTeamId ?? ''
    );

    if (!result) {
        throw new KNOWN_ERROR(
            'The invitation was not found or has already been processed',
            'INVITATION_NOT_FOUND_OR_ALREADY_PROCESSED'
        );
    }

    return c.json({
        data: "SUCCESS",
        error: null as ErrorType
    }, 200);
}; 