import { and, count, eq } from "drizzle-orm";
import {
    restaurantAddressTable,
    restaurantDeliveryZoneMapTable,
    restaurantOpenHoursTable,
    restaurantScheduledOrdersSettingsTable,
    restaurantTable,
    restaurantUserAdminsMapTable
} from './restaurant.schema';
import db from '../../drizzle';
import { calculateScheduledOrdersMinutes } from "./updateUtils/calculateScheduledOrdersMinutes";
import { calculateDeliveryZoneMinsMaxs } from "./updateUtils/calculateDeliveryZoneMinsMaxs";

export const isUserRestaurantAdminService = async function (
    userId: string, restaurantId: string
) {
    return await db.select({
        count: count()
    }).from(restaurantUserAdminsMapTable).where(
        and(
            eq(restaurantUserAdminsMapTable.userId, userId),
            eq(restaurantUserAdminsMapTable.restaurantId, restaurantId)
        )
    ).then(result => result[0].count === 1);
}

export const getMyRestaurantsService = async (userId: string) => {
    return (await db.query.restaurantUserAdminsMapTable.findMany({
        where: eq(restaurantUserAdminsMapTable.userId, userId),
        columns: {},
        // offset is only available for top level query.
        // offset: 2, // correct ✅
        with: {
            restaurant: {
                // offset: 3, // incorrect ❌
                columns: {
                    id: true,
                    name: true,
                },
                with: {
                    address: {
                        columns: {
                            address1: true,
                        }
                    }
                },
                // extras: {
                //     loweredName: sql`lower(${restaurantTable.name})`.as('lowered_name'),
                // },
            }
        },
        // extras: {
        //     loweredName: sql`lower(${restaurantTable.name})`.as('lowered_name'),
        // },
    })).map(item => item.restaurant);
}

export const createRestaurantService = async (userId: string, name: string) => {
    return await db.transaction(async (tx) => {
        const restaurant = await tx.insert(restaurantTable).values({
            name: name,
            ownerUserId: userId,
        }).returning({ id: restaurantTable.id });

        await tx.insert(restaurantUserAdminsMapTable).values({
            restaurantId: restaurant[0].id,
            userId: userId,
        });

        return restaurant[0].id;
    })
}

export const updateRestaurantService = async (
    restaurantId: string,
    data: Partial<typeof restaurantTable.$inferInsert> & {
        address?: Partial<typeof restaurantAddressTable.$inferInsert>
        openHours?: Partial<typeof restaurantOpenHoursTable.$inferInsert>
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
            scheduledOrdersSettings,
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
                // TODO calculate minLat maxLat minLng maxLng values from zones
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


// type NonEmpty<T> = T extends {} ? (T[keyof T] extends never ? never : T) : T;
// type getRestaurantServiceReturnType = NonNullable<Awaited<ReturnType<typeof getRestaurantService>>>;
// // type deliveryZones = getRestaurantServiceReturnType['deliveryZones']
// type address = getRestaurantServiceReturnType['address']
// type nonEmptyAddress = NonEmpty<address>
// const a: newAddress = {
//     address1: '',
//     address2: '',
//     city: '',
//     province: '',
//     postalCode: '',
// }
// type RestaurantWithoutEmptyAddress = Omit<getRestaurantServiceReturnType, 'address'> & {
//     address: Exclude<getRestaurantServiceReturnType['address'], {}>
// };

export const getRestaurantService = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantTable.$inferSelect, boolean>> & {
        address?: Partial<Record<keyof typeof restaurantAddressTable.$inferSelect, boolean>>
        openHours?: Partial<Record<keyof typeof restaurantOpenHoursTable.$inferSelect, boolean>>
        scheduledOrdersSettings?: Partial<Record<keyof typeof restaurantScheduledOrdersSettingsTable.$inferSelect, boolean>>
        deliveryZones?: Partial<Record<keyof typeof restaurantDeliveryZoneMapTable.$inferSelect, boolean>>
    }
) => {
    const restaurant = await db.query.restaurantTable.findFirst({
        where: eq(restaurantTable.id, restaurantId),
        columns: columns,
        with: {
            ...(columns?.address && {
                address: {
                    columns: columns.address
                }
            }),
            ...(columns?.openHours && {
                openHours: {
                    columns: columns.openHours
                }
            }),
            ...(columns?.scheduledOrdersSettings && {
                scheduledOrdersSettings: {
                    columns: columns.scheduledOrdersSettings
                }
            }),
            ...(columns?.deliveryZones && {
                deliveryZones: {
                    columns: columns.deliveryZones
                }
            })
        }
    })

    // this typing is to make sure typing work with hono rpc.
    // https://hono.dev/docs/guides/rpc
    // api never returns {} but drizzle adds a {} when there is no "with" query ...
    type NonEmpty<T> = T extends {} ? (T[keyof T] extends never ? never : T) : T;
    type restaurantType = NonNullable<typeof restaurant>;

    type address = restaurantType['address'] // this has | {}
    type nonEmptyAddress = NonEmpty<address> // this has not {}

    type openHours = restaurantType['openHours'] // this has | {}
    type nonEmptyOpenHours = NonEmpty<openHours> // this has not {}

    type scheduledOrdersSettings = restaurantType['scheduledOrdersSettings'] // this has | {}
    type nonEmptyScheduledOrdersSettings = NonEmpty<scheduledOrdersSettings> // this has not {}

    type deliveryZones = restaurantType['deliveryZones'] // this has | {}
    type nonEmptyDeliveryZones = NonEmpty<deliveryZones> // this has not {}

    type newRestaurantType = (Omit<restaurantType, 'address' | 'openHours' | 'deliveryZones' | 'scheduledOrdersSettings'> & {
        address?: nonEmptyAddress
        openHours?: nonEmptyOpenHours
        scheduledOrdersSettings?: nonEmptyScheduledOrdersSettings
        deliveryZones?: nonEmptyDeliveryZones
    }) | undefined

    return restaurant as newRestaurantType;
}