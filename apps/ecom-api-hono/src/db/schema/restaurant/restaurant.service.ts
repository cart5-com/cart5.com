import { and, count, eq } from "drizzle-orm";
import { restaurantTable, restaurantUserAdminsMapTable } from './restaurant.schema';
import db from '../../drizzle';

export const checkUserIsRestaurantAdminService = async function (
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

export const getMyRestaurantsService = async (userId: string) => {
    return await db
        .select({
            id: restaurantTable.id,
            name: restaurantTable.name,
        })
        .from(restaurantTable)
        .innerJoin(restaurantUserAdminsMapTable, eq(restaurantTable.id, restaurantUserAdminsMapTable.restaurantId))
        .where(eq(restaurantUserAdminsMapTable.userId, userId));
}

export const createRestaurantService = async (userId: string, name: string) => {
    return await db.transaction(async (tx) => {
        const restaurant = await tx.insert(restaurantTable).values({
            name: name,
            ownerUserId: userId,
        }).returning({ id: restaurantTable.id });

        await tx.insert(restaurantUserAdminsMapTable).values({
            restaurantId: restaurant[0].id,
            userId: userId,
        });

        return restaurant[0].id;
    })
}

export const updateRestaurantService = async (
    restaurantId: string,
    data: Partial<typeof restaurantTable.$inferInsert>
) => {
    // unallowed fields for admins
    const { id, ownerUserId, created_at_ts, updated_at_ts,
        ...rest
    } = data;
    return (await db
        .update(restaurantTable)
        .set(rest)
        .where(eq(restaurantTable.id, restaurantId)));
}

export const getRestaurantService = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantTable.$inferSelect, boolean>>
) => {
    return await db.query.restaurantTable.findFirst({
        where: eq(restaurantTable.id, restaurantId),
        columns: columns
    })
}

