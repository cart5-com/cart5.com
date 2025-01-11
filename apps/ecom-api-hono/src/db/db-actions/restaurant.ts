import { and, count, eq } from "drizzle-orm";
import type { Context } from "hono";
import getDrizzleDb from "../drizzle";
import type { honoTypes } from "../../index";
import { restaurantTable, restaurantUserAdminsMapTable } from "../schema/restaurant";
import { KNOWN_ERROR } from "lib/errors";

export const getUserRestaurants = async (options: { userId: string, c: Context<honoTypes> }) => {
    return await getDrizzleDb(options.c)
        .select({
            id: restaurantTable.id,
            name: restaurantTable.name,
        })
        .from(restaurantTable)
        .innerJoin(restaurantUserAdminsMapTable, eq(restaurantTable.id, restaurantUserAdminsMapTable.restaurantId))
        .where(eq(restaurantUserAdminsMapTable.userId, options.userId));
}

export const createRestaurant = async (options: { name: string, userId: string, c: Context<honoTypes> }) => {
    const db = getDrizzleDb(options.c);
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

export const checkUserIsRestaurantAdmin = async (options: {
    userId: string,
    restaurantId: string,
    c: Context<honoTypes>
}) => {
    return await getDrizzleDb(options.c).select({
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
    c: Context<honoTypes>
}) => {
    const { restaurantId, dataToUpdate, c } = options;
    const db = getDrizzleDb(c);

    // unallowed fields for admins
    const { id, ownerUserId, created_at_ts, updated_at_ts,
        ...updateData } = dataToUpdate;

    const result = await db
        .update(restaurantTable)
        .set(updateData) // Type assertion to bypass the type error
        .where(eq(restaurantTable.id, restaurantId))

    if (result.rowsAffected !== 1) {
        throw new KNOWN_ERROR('error', 'ERROR');
    }

    return true;
}