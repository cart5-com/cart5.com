import { type Context, type Next } from 'hono'
import { KNOWN_ERROR } from '../../../types/errors'
import db from '../../../db/drizzle';
import { restaurantUserAdminsMapTable } from '../../../db/schema/restaurant.schema';
import { and, eq, count } from 'drizzle-orm';

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
    return await isUserRestaurantAdminService(userId, restaurantId);
}

export const isUserRestaurantAdminService = async function (
    userId: string, restaurantId: string
) {
    return await db.select({
        count: count()
    }).from(restaurantUserAdminsMapTable).where(
        and(
            eq(restaurantUserAdminsMapTable.userId, userId),
            eq(restaurantUserAdminsMapTable.restaurantId, restaurantId)
        )
    ).then(result => result[0].count === 1);
}