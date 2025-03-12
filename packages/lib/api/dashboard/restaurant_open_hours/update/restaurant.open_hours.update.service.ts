import db from '../../../../db/drizzle';
import { restaurantOpenHoursTable } from '../../../../db/schema/restaurant.schema';
import type { InferInsertModel } from 'drizzle-orm';

export const updateOpenHours_Service = async (
    id: string,
    openHoursData: Partial<InferInsertModel<typeof restaurantOpenHoursTable>>
) => {
    const {
        // unallowed fields for admins
        restaurantId,
        // other fields
        ...data
    } = openHoursData;
    return await db.insert(restaurantOpenHoursTable)
        .values({ ...data, restaurantId: id })
        .onConflictDoUpdate({
            target: restaurantOpenHoursTable.restaurantId,
            set: data
        });
} 