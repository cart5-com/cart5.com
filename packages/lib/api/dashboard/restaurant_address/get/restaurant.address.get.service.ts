import { eq } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { restaurantAddressTable } from '../../../../db/schema/restaurant.schema';

export const getAddress_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantAddressTable.$inferSelect, boolean>>
) => {
    return await db.query.restaurantAddressTable.findFirst({
        where: eq(restaurantAddressTable.restaurantId, restaurantId),
        columns: columns
    });
} 