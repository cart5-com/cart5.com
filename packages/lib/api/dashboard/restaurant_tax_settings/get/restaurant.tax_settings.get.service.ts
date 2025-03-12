import { eq } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { restaurantTaxSettingsTable } from '../../../../db/schema/restaurant.schema';

export const getTaxSettings_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantTaxSettingsTable.$inferSelect, boolean>>
) => {
    return await db.query.restaurantTaxSettingsTable.findFirst({
        where: eq(restaurantTaxSettingsTable.restaurantId, restaurantId),
        columns: columns
    });
} 