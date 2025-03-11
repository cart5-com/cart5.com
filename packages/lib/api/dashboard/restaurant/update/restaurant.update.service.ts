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
import type { DeliveryZone, TimeForm } from "../../../../types/restaurantTypes";
import type { Point } from "../../../../types/restaurantTypes";

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



// TODO: move this
export const calculateDeliveryZoneMinsMaxs = (deliveryZones: DeliveryZone[]) => {
    if (!deliveryZones.length) {
        return {
            minLat: null,
            maxLat: null,
            minLng: null,
            maxLng: null,
        };
    }

    let points: Point[] = [];

    // Collect all points from different shape types
    deliveryZones.forEach(zone => {
        if (!zone.isActive) return;

        switch (zone.shapeType) {
            case 'polygon':
                if (zone.polygonArea) {
                    points.push(...zone.polygonArea);
                }
                break;

            case 'circle':
                if (zone.circleArea) {
                    const { center, radius } = zone.circleArea;
                    // Convert radius from meters to degrees
                    // Latitude: 1 degree = 111,111 meters
                    const latDegrees = radius ? radius / 111111 : 0;

                    if (center?.lat && center?.lng) {
                        // Longitude: 1 degree = 111,111 * cos(latitude) meters
                        const lngDegrees = radius ? radius / (111111 * Math.cos(center.lat * Math.PI / 180)) : 0;

                        points.push(
                            { lat: center.lat + latDegrees, lng: center.lng + lngDegrees }, // North-East
                            { lat: center.lat + latDegrees, lng: center.lng - lngDegrees }, // North-West
                            { lat: center.lat - latDegrees, lng: center.lng + lngDegrees }, // South-East
                            { lat: center.lat - latDegrees, lng: center.lng - lngDegrees }  // South-West
                        );
                    }
                }
                break;

            case 'rectangle':
                if (zone.rectangleArea) {
                    const { topLeft, bottomRight } = zone.rectangleArea;
                    if (topLeft?.lat && topLeft?.lng && bottomRight?.lat && bottomRight?.lng) {
                        points.push(
                            topLeft,
                            bottomRight,
                            { lat: topLeft.lat, lng: bottomRight.lng },    // topRight
                            { lat: bottomRight.lat, lng: topLeft.lng }     // bottomLeft
                        );
                    }
                }
                break;
        }
    });

    const validPoints = points.filter(p => p.lat != null && p.lng != null);
    if (!validPoints.length) {
        return {
            minLat: null,
            maxLat: null,
            minLng: null,
            maxLng: null,
        };
    }

    return {
        minLat: Math.min(...validPoints.map(p => p.lat!)),
        maxLat: Math.max(...validPoints.map(p => p.lat!)),
        minLng: Math.min(...validPoints.map(p => p.lng!)),
        maxLng: Math.max(...validPoints.map(p => p.lng!)),
    };
};


const convertToMinutes = (timeForm: TimeForm) => {
    const { timeValue, timeUnit } = timeForm;
    const minutes = (timeValue ?? 0) * (timeUnit === 'minutes' ? 1 : timeUnit === 'hours' ? 60 : 1440);
    return minutes;
}

export const calculateScheduledOrdersMinutes = (scheduledOrdersSettings?: Partial<typeof restaurantScheduledOrdersSettingsTable.$inferInsert>) => {
    let pickup_minTimeInAdvance_minutes: number | null = null
    let pickup_maxTimeInAdvance_minutes: number | null = null
    if (
        scheduledOrdersSettings?.pickup_settings &&
        scheduledOrdersSettings?.pickup_settings.min &&
        scheduledOrdersSettings?.pickup_settings.max
    ) {
        pickup_minTimeInAdvance_minutes = convertToMinutes(scheduledOrdersSettings?.pickup_settings.min)
        pickup_maxTimeInAdvance_minutes = convertToMinutes(scheduledOrdersSettings?.pickup_settings.max)
    }

    let delivery_minTimeInAdvance_minutes: number | null = null
    let delivery_maxTimeInAdvance_minutes: number | null = null
    if (
        scheduledOrdersSettings?.delivery_settings &&
        scheduledOrdersSettings?.delivery_settings.min &&
        scheduledOrdersSettings?.delivery_settings.max
    ) {
        delivery_minTimeInAdvance_minutes = convertToMinutes(scheduledOrdersSettings?.delivery_settings.min)
        delivery_maxTimeInAdvance_minutes = convertToMinutes(scheduledOrdersSettings?.delivery_settings.max)
    }

    return {
        pickup_minTimeInAdvance_minutes,
        pickup_maxTimeInAdvance_minutes,
        delivery_minTimeInAdvance_minutes,
        delivery_maxTimeInAdvance_minutes
    }
}
