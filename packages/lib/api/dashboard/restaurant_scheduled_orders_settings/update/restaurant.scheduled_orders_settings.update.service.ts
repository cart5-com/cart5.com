import db from '../../../../db/drizzle';
import { restaurantScheduledOrdersSettingsTable } from '../../../../db/schema/restaurant.schema';
import type { InferInsertModel } from 'drizzle-orm';
import { calculateScheduledOrdersMinutes } from './calculateScheduledOrdersMinutes';

export const updateScheduledOrdersSettings_Service = async (
    id: string,
    scheduledOrdersSettingsData: Partial<InferInsertModel<typeof restaurantScheduledOrdersSettingsTable>>
) => {
    const {
        // unallowed fields for admins
        restaurantId,
        // other fields
        ...data
    } = scheduledOrdersSettingsData;

    const {
        pickup_minTimeInAdvance_minutes,
        pickup_maxTimeInAdvance_minutes,
        delivery_minTimeInAdvance_minutes,
        delivery_maxTimeInAdvance_minutes
    } = calculateScheduledOrdersMinutes(data);
    const scheduledOrdersSettingsDataWithMinutes = {
        ...scheduledOrdersSettingsData,
        pickup_minTimeInAdvance_minutes,
        pickup_maxTimeInAdvance_minutes,
        delivery_minTimeInAdvance_minutes,
        delivery_maxTimeInAdvance_minutes
    }


    return await db.insert(restaurantScheduledOrdersSettingsTable)
        .values({ ...scheduledOrdersSettingsDataWithMinutes, restaurantId: id })
        .onConflictDoUpdate({
            target: restaurantScheduledOrdersSettingsTable.restaurantId,
            set: scheduledOrdersSettingsDataWithMinutes
        });
} 