import db from '../../../../db/drizzle';
import { restaurantMenuTable } from '../../../../db/schema/restaurant.schema';
import type { InferInsertModel } from 'drizzle-orm';

export const updateMenu_Service = async (
    id: string,
    menuData: Partial<InferInsertModel<typeof restaurantMenuTable>>
) => {
    const {
        // unallowed fields for admins
        restaurantId,
        // other fields
        ...data
    } = menuData;
    return await db.insert(restaurantMenuTable)
        .values({ ...data, restaurantId: id })
        .onConflictDoUpdate({
            target: restaurantMenuTable.restaurantId,
            set: data
        });
}