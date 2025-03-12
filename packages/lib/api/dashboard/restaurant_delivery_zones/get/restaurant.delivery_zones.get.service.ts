import { eq } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { restaurantDeliveryZoneMapTable } from '../../../../db/schema/restaurant.schema';

export const getDeliveryZones_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantDeliveryZoneMapTable.$inferSelect, boolean>>
) => {
    return await db.query.restaurantDeliveryZoneMapTable.findFirst({
        where: eq(restaurantDeliveryZoneMapTable.restaurantId, restaurantId),
        columns: columns
    });
} 