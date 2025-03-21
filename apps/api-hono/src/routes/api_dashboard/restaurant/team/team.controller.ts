import type { Context } from "hono";
import type { HonoVariables } from "@api-hono/types/HonoVariables";
import type { ErrorType } from "@lib/types/errors";
import { getTeam_Service, getTeamMembers_Service } from "@db/services/team.service";
import { getRestaurant_Service } from "@db/services/restaurant.service";
import { redactEmail } from "@lib/utils/redactEmail";

export const getRestaurantTeamMembers_Handler = async (c: Context<
    HonoVariables,
    "/:restaurantId/team"
>) => {
    const restaurant = await getRestaurant_Service(c.req.param('restaurantId'), {
        ownerTeamId: true
    });
    const team = await getTeam_Service(restaurant?.ownerTeamId ?? '', {
        ownerUserId: true
    });
    const teamMembers = (await getTeamMembers_Service(restaurant?.ownerTeamId ?? '', team?.ownerUserId ?? ''))
        .map(member => ({
            ...member,
            email: redactEmail(member.email)
        }));
    return c.json({
        data: teamMembers,
        error: null as ErrorType
    }, 200);
}; 