import { type Context, type Next } from 'hono'
import { KNOWN_ERROR } from '../../../types/errors'
import db from '../../../db/drizzle';
import { restaurantTable } from '../../../db/schema/restaurant.schema';
import { eq } from 'drizzle-orm';
import { isAdminCheck } from '../team/_service_utils/isAdminCheck';
import { TEAM_PERMISSIONS } from '../../../db/schema/team.schema';

export async function restaurantAdminCheck(c: Context, next: Next) {
    const userId = c.get('USER')?.id;
    const restaurantId = c.req.param('restaurantId');
    if (!userId || !restaurantId) {
        throw new KNOWN_ERROR("Unauthorized", "UNAUTHORIZED");
    }
    const isAdmin = await isUserRestaurantAdmin(userId, restaurantId);
    if (!isAdmin) {
        throw new KNOWN_ERROR("Not admin", "UNAUTHORIZED");
    }
    await next();
}

export const isUserRestaurantAdmin = async function (
    userId: string, restaurantId: string
) {
    // First, get the restaurant's owner and support team IDs
    const restaurant = await db.select({
        ownerTeamId: restaurantTable.ownerTeamId,
        supportTeamId: restaurantTable.supportTeamId
    })
        .from(restaurantTable)
        .where(eq(restaurantTable.id, restaurantId))
        .then(results => results[0]);

    if (!restaurant) {
        return false;
    }
    return await isAdminCheck(userId, restaurant.ownerTeamId, restaurant.supportTeamId,
        [
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.RESTAURANT_MANAGER
        ]
    );
}