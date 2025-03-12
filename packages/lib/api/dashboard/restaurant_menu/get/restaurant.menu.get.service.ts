import { eq } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { restaurantMenuTable } from '../../../../db/schema/restaurant.schema';

export const getMenu_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantMenuTable.$inferSelect, boolean>>
) => {
    return await db.query.restaurantMenuTable.findFirst({
        where: eq(restaurantMenuTable.restaurantId, restaurantId),
        columns: columns
    });
} 