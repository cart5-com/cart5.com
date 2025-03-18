import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ErrorType } from "@lib/types/errors";
import { getRestaurant_Service } from "@db/services/restaurant.service";
import { getTeamInvitations_Service } from "@db/services/team.service";
import { redactEmail } from "@lib/utils/redactEmail";

export const getRestaurantTeamInvitations_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/team_invitations"
>) => {
    const restaurant = await getRestaurant_Service(c.req.param('restaurantId'), {
        ownerTeamId: true
    });

    const invitations = (await getTeamInvitations_Service(restaurant?.ownerTeamId ?? ''))
        .map(invitation => ({
            ...invitation,
            email: redactEmail(invitation.email)
        }))
        .map(invitation => ({
            ...invitation,
            status: invitation.status === 'PENDING' && invitation.createdAt < Date.now() - 1000 * 60 * 60 * 24 * 7 ? 'EXPIRED' : invitation.status
        }));

    return c.json({
        data: invitations,
        error: null as ErrorType
    }, 200);
}; 