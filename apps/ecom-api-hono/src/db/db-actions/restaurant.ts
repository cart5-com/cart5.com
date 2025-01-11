import { and, count, eq } from "drizzle-orm";
import type { Context } from "hono";
import type { honoTypes } from "../../index";
import { restaurantTable, restaurantUserAdminsMapTable } from "../schema/restaurant";
import { KNOWN_ERROR } from "lib/errors";

export const getUserRestaurants = async (
    c: Context<honoTypes>,
    options: { userId: string }
) => {
    return await c.get('DRIZZLE_DB')
        .select({
            id: restaurantTable.id,
            name: restaurantTable.name,
        })
        .from(restaurantTable)
        .innerJoin(restaurantUserAdminsMapTable, eq(restaurantTable.id, restaurantUserAdminsMapTable.restaurantId))
        .where(eq(restaurantUserAdminsMapTable.userId, options.userId));
}

export const createRestaurant = async (
    c: Context<honoTypes>,
    options: { name: string, userId: string }
) => {
    const db = c.get('DRIZZLE_DB');
    return await db.transaction(async (tx) => {
        const restaurant = await tx.insert(restaurantTable).values({
            name: options.name,
            ownerUserId: options.userId,
        }).returning({ id: restaurantTable.id });

        await tx.insert(restaurantUserAdminsMapTable).values({
            restaurantId: restaurant[0].id,
            userId: options.userId,
        });

        return restaurant[0].id;
    });
}

export const checkUserIsRestaurantAdmin = async (
    c: Context<honoTypes>,
    options: { userId: string, restaurantId: string }
) => {
    return await c.get('DRIZZLE_DB').select({
        count: count()
    }).from(restaurantUserAdminsMapTable).where(
        and(
            eq(restaurantUserAdminsMapTable.userId, options.userId),
            eq(restaurantUserAdminsMapTable.restaurantId, options.restaurantId)
        )
    ).then(result => result[0].count === 1);
}

export const updateRestaurant = async (options: {
    restaurantId: string,
    dataToUpdate: Partial<typeof restaurantTable.$inferInsert>,
}, c: Context<honoTypes>) => {
    const { restaurantId, dataToUpdate } = options;

    // unallowed fields for admins
    const { id, ownerUserId, created_at_ts, updated_at_ts,
        ...updateData } = dataToUpdate;

    const result = await c.get('DRIZZLE_DB')
        .update(restaurantTable)
        .set(updateData) // Type assertion to bypass the type error
        .where(eq(restaurantTable.id, restaurantId))

    if (result.rowsAffected !== 1) {
        throw new KNOWN_ERROR('error', 'ERROR');
    }

    return true;
}