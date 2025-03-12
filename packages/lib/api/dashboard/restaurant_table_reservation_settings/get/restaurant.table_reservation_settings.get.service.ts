import { eq } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { restaurantTableReservationSettingsTable } from '../../../../db/schema/restaurant.schema';

export const getTableReservationSettings_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantTableReservationSettingsTable.$inferSelect, boolean>>
) => {
    return await db.query.restaurantTableReservationSettingsTable.findFirst({
        where: eq(restaurantTableReservationSettingsTable.restaurantId, restaurantId),
        columns: columns
    });
} 