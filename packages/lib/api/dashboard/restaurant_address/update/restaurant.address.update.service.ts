import db from '../../../../db/drizzle';
import { restaurantAddressTable } from '../../../../db/schema/restaurant.schema';
import type { InferInsertModel } from 'drizzle-orm';

export const updateAddress_Service = async (
    id: string,
    addressData: Partial<InferInsertModel<typeof restaurantAddressTable>>
) => {
    const {
        // unallowed fields for admins
        restaurantId,
        // other fields
        ...data
    } = addressData;
    return await db.insert(restaurantAddressTable)
        .values({ ...data, restaurantId: id })
        .onConflictDoUpdate({
            target: restaurantAddressTable.restaurantId,
            set: data
        });
} 