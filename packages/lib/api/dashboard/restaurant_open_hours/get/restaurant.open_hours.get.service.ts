import { eq } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { restaurantOpenHoursTable } from '../../../../db/schema/restaurant.schema';

export const getOpenHours_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantOpenHoursTable.$inferSelect, boolean>>
) => {
    return await db.query.restaurantOpenHoursTable.findFirst({
        where: eq(restaurantOpenHoursTable.restaurantId, restaurantId),
        columns: columns
    });
} 