import { eq } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { restaurantTable } from '../../../../db/schema/restaurant.schema';

export const getRestaurant_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantTable.$inferSelect, boolean>>
) => {
    return await db.query.restaurantTable.findFirst({
        where: eq(restaurantTable.id, restaurantId),
        columns: columns,
    })
}