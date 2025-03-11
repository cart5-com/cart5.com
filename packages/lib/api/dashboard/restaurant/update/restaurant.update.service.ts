import { eq } from "drizzle-orm";
import {
    restaurantAddressTable,
    restaurantDeliveryZoneMapTable,
    restaurantOpenHoursTable,
    restaurantMenuTable,
    restaurantTableReservationSettingsTable,
    restaurantScheduledOrdersSettingsTable,
    restaurantTaxSettingsTable,
    restaurantTable,
    restaurantPaymentMethodsTable
} from '../../../../db/schema/restaurant.schema';
import db from '../../../../db/drizzle';

import { cleanEmptyProperties } from '../../../../types/menuType';
import { calculateScheduledOrdersMinutes } from "./calculateScheduledOrdersMinutes";
import { calculateDeliveryZoneMinsMaxs } from "./calculateDeliveryZoneMinsMaxs";

export const updateRestaurant_Service = async (
    restaurantId: string,
    data: Partial<typeof restaurantTable.$inferInsert> & {
        address?: Partial<typeof restaurantAddressTable.$inferInsert>
        openHours?: Partial<typeof restaurantOpenHoursTable.$inferInsert>
        menu?: Partial<typeof restaurantMenuTable.$inferInsert>
        paymentMethods?: Partial<typeof restaurantPaymentMethodsTable.$inferInsert>
        tableReservationSettings?: Partial<typeof restaurantTableReservationSettingsTable.$inferInsert>
        taxSettings?: Partial<typeof restaurantTaxSettingsTable.$inferInsert>
        scheduledOrdersSettings?: Partial<typeof restaurantScheduledOrdersSettingsTable.$inferInsert>
        deliveryZones?: Partial<typeof restaurantDeliveryZoneMapTable.$inferInsert>
    }
) => {

    return await db.transaction(async (tx) => {
        const {
            // unallowed fields for admins
            id, ownerUserId, created_at_ts, updated_at_ts,
            // other restaurant tables
            address,
            openHours,
            menu,
            paymentMethods,
            tableReservationSettings,
            scheduledOrdersSettings,
            taxSettings,
            deliveryZones,
            // allowed fields for admins
            ...restaurantData
        } = data;

        const updates = [];

        // Update restaurant data
        if (Object.keys(restaurantData).length > 0) {
            updates[updates.length] = tx.update(restaurantTable)
                .set(restaurantData)
                .where(eq(restaurantTable.id, restaurantId));
        }

        // Update address data if provided
        if (address) {
            const { restaurantId: _, ...addressData } = address;
            if (Object.keys(addressData).length > 0) {
                updates[updates.length] = tx.insert(restaurantAddressTable)
                    .values({ ...addressData, restaurantId })
                    .onConflictDoUpdate({
                        target: restaurantAddressTable.restaurantId,
                        set: addressData
                    });
            }
        }

        if (openHours) {
            const { restaurantId: _, ...openHoursData } = openHours;
            if (Object.keys(openHoursData).length > 0) {
                updates[updates.length] = tx.insert(restaurantOpenHoursTable)
                    .values({ ...openHoursData, restaurantId })
                    .onConflictDoUpdate({
                        target: restaurantOpenHoursTable.restaurantId,
                        set: openHoursData
                    });
            }
        }

        if (menu) {
            const { restaurantId: _, ...menuData } = menu;
            if (Object.keys(menuData).length > 0) {
                if (menuData.menuRoot) {
                    menuData.menuRoot = cleanEmptyProperties(menuData.menuRoot);
                }
                updates[updates.length] = tx.insert(restaurantMenuTable)
                    .values({ ...menuData, restaurantId })
                    .onConflictDoUpdate({
                        target: restaurantMenuTable.restaurantId,
                        set: menuData
                    });
            }
        }

        if (paymentMethods) {
            const { restaurantId: _, ...paymentMethodsData } = paymentMethods;
            if (Object.keys(paymentMethodsData).length > 0) {
                updates[updates.length] = tx.insert(restaurantPaymentMethodsTable)
                    .values({ ...paymentMethodsData, restaurantId })
                    .onConflictDoUpdate({
                        target: restaurantPaymentMethodsTable.restaurantId,
                        set: paymentMethodsData
                    });
            }
        }

        if (tableReservationSettings) {
            const { restaurantId: _, ...tableReservationSettingsData } = tableReservationSettings;
            if (Object.keys(tableReservationSettingsData).length > 0) {
                updates[updates.length] = tx.insert(restaurantTableReservationSettingsTable)
                    .values({ ...tableReservationSettingsData, restaurantId })
                    .onConflictDoUpdate({
                        target: restaurantTableReservationSettingsTable.restaurantId,
                        set: tableReservationSettingsData
                    });
            }
        }

        if (taxSettings) {
            const { restaurantId: _, ...taxSettingsData } = taxSettings;
            if (Object.keys(taxSettingsData).length > 0) {
                updates[updates.length] = tx.insert(restaurantTaxSettingsTable)
                    .values({ ...taxSettingsData, restaurantId })
                    .onConflictDoUpdate({
                        target: restaurantTaxSettingsTable.restaurantId,
                        set: taxSettingsData
                    });
            }
        }

        if (scheduledOrdersSettings) {
            const { restaurantId: _, ...scheduledOrdersSettingsData } = scheduledOrdersSettings;
            if (Object.keys(scheduledOrdersSettingsData).length > 0) {
                const {
                    pickup_minTimeInAdvance_minutes,
                    pickup_maxTimeInAdvance_minutes,
                    delivery_minTimeInAdvance_minutes,
                    delivery_maxTimeInAdvance_minutes
                } = calculateScheduledOrdersMinutes(scheduledOrdersSettingsData);
                const scheduledOrdersSettingsDataWithMinutes = {
                    ...scheduledOrdersSettingsData,
                    pickup_minTimeInAdvance_minutes,
                    pickup_maxTimeInAdvance_minutes,
                    delivery_minTimeInAdvance_minutes,
                    delivery_maxTimeInAdvance_minutes
                }
                updates[updates.length] = tx.insert(restaurantScheduledOrdersSettingsTable)
                    .values({ ...scheduledOrdersSettingsDataWithMinutes, restaurantId })
                    .onConflictDoUpdate({
                        target: restaurantScheduledOrdersSettingsTable.restaurantId,
                        set: scheduledOrdersSettingsDataWithMinutes
                    });
            }
        }

        if (deliveryZones) {
            const { restaurantId: _, ...deliveryZoneData } = deliveryZones;
            if (Object.keys(deliveryZoneData).length > 0) {
                const { minLat, maxLat, minLng, maxLng } = calculateDeliveryZoneMinsMaxs(
                    deliveryZoneData.zones || []
                );
                const deliveryZoneDataWithMinsMaxs = {
                    ...deliveryZoneData,
                    minLat,
                    maxLat,
                    minLng,
                    maxLng
                }
                updates[updates.length] = tx.insert(restaurantDeliveryZoneMapTable)
                    .values({ ...deliveryZoneDataWithMinsMaxs, restaurantId })
                    .onConflictDoUpdate({
                        target: restaurantDeliveryZoneMapTable.restaurantId,
                        set: deliveryZoneDataWithMinsMaxs
                    });
            }
        }
        return await Promise.all(updates);
    });
}