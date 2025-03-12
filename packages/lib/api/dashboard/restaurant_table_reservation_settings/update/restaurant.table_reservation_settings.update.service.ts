import db from '../../../../db/drizzle';
import { restaurantTableReservationSettingsTable } from '../../../../db/schema/restaurant.schema';
import type { InferInsertModel } from 'drizzle-orm';

export const updateTableReservationSettings_Service = async (
    id: string,
    tableReservationSettingsData: Partial<InferInsertModel<typeof restaurantTableReservationSettingsTable>>
) => {
    const {
        // unallowed fields for admins
        restaurantId,
        // other fields
        ...data
    } = tableReservationSettingsData;
    return await db.insert(restaurantTableReservationSettingsTable)
        .values({ ...data, restaurantId: id })
        .onConflictDoUpdate({
            target: restaurantTableReservationSettingsTable.restaurantId,
            set: data
        });
} 