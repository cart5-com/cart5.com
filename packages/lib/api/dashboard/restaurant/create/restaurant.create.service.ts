import db from '../../../../db/drizzle';
import { restaurantUserAdminsMapTable, restaurantTable } from '../../../../db/schema/restaurant.schema';

export const createRestaurant_Service = async (userId: string, name: string) => {
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