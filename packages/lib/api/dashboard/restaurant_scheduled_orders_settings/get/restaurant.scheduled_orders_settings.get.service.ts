import { eq } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { restaurantScheduledOrdersSettingsTable } from '../../../../db/schema/restaurant.schema';

export const getScheduledOrdersSettings_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantScheduledOrdersSettingsTable.$inferSelect, boolean>>
) => {
    return await db.query.restaurantScheduledOrdersSettingsTable.findFirst({
        where: eq(restaurantScheduledOrdersSettingsTable.restaurantId, restaurantId),
        columns: columns
    });
} 