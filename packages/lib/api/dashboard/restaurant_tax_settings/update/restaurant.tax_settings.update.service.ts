import db from '../../../../db/drizzle';
import { restaurantTaxSettingsTable } from '../../../../db/schema/restaurant.schema';
import type { InferInsertModel } from 'drizzle-orm';

export const updateTaxSettings_Service = async (
    id: string,
    taxSettingsData: Partial<InferInsertModel<typeof restaurantTaxSettingsTable>>
) => {
    const {
        // unallowed fields for admins
        restaurantId,
        // other fields
        ...data
    } = taxSettingsData;
    return await db.insert(restaurantTaxSettingsTable)
        .values({ ...data, restaurantId: id })
        .onConflictDoUpdate({
            target: restaurantTaxSettingsTable.restaurantId,
            set: data
        });
} 