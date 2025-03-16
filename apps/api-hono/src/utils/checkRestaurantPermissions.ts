import type { TEAM_PERMISSIONS } from "@lib/consts";
import type { Context } from "hono";
import type { Next } from "hono";
import { KNOWN_ERROR } from "@lib/types/errors";
import { isUserRestaurantAdmin } from "@db/services/restaurant.service";

// TODO: rename to createAdminCheckRestaurant
export function createAdminCheckRestraurant(
    permissions: (typeof TEAM_PERMISSIONS)[keyof typeof TEAM_PERMISSIONS][]
) {
    return async function (c: Context, next: Next) {
        const userId = c.get('USER')?.id;
        const restaurantId = c.req.param('restaurantId');
        if (!userId || !restaurantId) {
            throw new KNOWN_ERROR("Unauthorized", "UNAUTHORIZED");
        }
        const isAdmin = await isUserRestaurantAdmin(userId, restaurantId, permissions);
        if (!isAdmin) {
            throw new KNOWN_ERROR("Not admin", "UNAUTHORIZED");
        }
        await next();
    }
}
