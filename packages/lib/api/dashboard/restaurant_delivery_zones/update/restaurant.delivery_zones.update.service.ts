import db from '../../../../db/drizzle';
import { restaurantDeliveryZoneMapTable } from '../../../../db/schema/restaurant.schema';
import type { InferInsertModel } from 'drizzle-orm';
import { calculateDeliveryZoneMinsMaxs } from './calculateDeliveryZoneMinsMaxs';

export const updateDeliveryZones_Service = async (
    id: string,
    deliveryZonesData: Partial<InferInsertModel<typeof restaurantDeliveryZoneMapTable>>
) => {
    const {
        // unallowed fields for admins
        restaurantId,
        // other fields
        ...data
    } = deliveryZonesData;

    if (data.zones) {
        const { minLat, maxLat, minLng, maxLng } = calculateDeliveryZoneMinsMaxs(
            data.zones
        );
        const deliveryZoneDataWithMinsMaxs = {
            ...data,
            minLat,
            maxLat,
            minLng,
            maxLng
        }
        return await db.insert(restaurantDeliveryZoneMapTable)
            .values({ ...deliveryZoneDataWithMinsMaxs, restaurantId: id })
            .onConflictDoUpdate({
                target: restaurantDeliveryZoneMapTable.restaurantId,
                set: deliveryZoneDataWithMinsMaxs
            });
    } else {
        return await db.insert(restaurantDeliveryZoneMapTable)
            .values({ ...data, restaurantId: id })
            .onConflictDoUpdate({
                target: restaurantDeliveryZoneMapTable.restaurantId,
                set: data
            });
    }
}
