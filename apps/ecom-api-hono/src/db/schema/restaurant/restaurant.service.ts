import { and, count, eq } from "drizzle-orm";
import { restaurantAddressTable, restaurantDeliveryZoneMapTable, restaurantTable, restaurantUserAdminsMapTable } from './restaurant.schema';
import db from '../../drizzle';

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
    // return await db
    //     .select({
    //         id: restaurantTable.id,
    //         name: restaurantTable.name,
    //         address1: restaurantAddressTable.address1,
    //     })
    //     .from(restaurantTable)
    //     .innerJoin(restaurantUserAdminsMapTable, eq(restaurantTable.id, restaurantUserAdminsMapTable.restaurantId))
    //     .innerJoin(restaurantAddressTable, eq(restaurantTable.id, restaurantAddressTable.restaurantId))
    //     .where(eq(restaurantUserAdminsMapTable.userId, userId));
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

        await tx.insert(restaurantAddressTable).values({
            restaurantId: restaurant[0].id,
        });

        await tx.insert(restaurantDeliveryZoneMapTable).values({
            restaurantId: restaurant[0].id,
        });

        return restaurant[0].id;
    })
}

export const updateRestaurantService = async (
    restaurantId: string,
    data: Partial<typeof restaurantTable.$inferInsert> & {
        address?: Partial<typeof restaurantAddressTable.$inferInsert>
    } & {
        deliveryZones?: Partial<typeof restaurantDeliveryZoneMapTable.$inferInsert>
    }
) => {

    return await db.transaction(async (tx) => {
        const {
            // unallowed fields for admins
            id, ownerUserId, created_at_ts, updated_at_ts,
            address,
            deliveryZones,
            ...restaurantData
        } = data;
        // Update restaurant data
        if (Object.keys(restaurantData).length > 0) {
            await tx.update(restaurantTable)
                .set(restaurantData)
                .where(eq(restaurantTable.id, restaurantId));
        }

        // Update address data if provided
        if (address) {
            const { restaurantId: _, ...addressData } = address;
            if (Object.keys(addressData).length > 0) {
                await tx.update(restaurantAddressTable)
                    .set(addressData)
                    .where(eq(restaurantAddressTable.restaurantId, restaurantId));
            }
        }

        if (deliveryZones) {
            const { restaurantId: _, ...deliveryZoneData } = deliveryZones;
            if (Object.keys(deliveryZoneData).length > 0) {
                await tx.update(restaurantDeliveryZoneMapTable)
                    .set(deliveryZoneData)
                    .where(eq(restaurantDeliveryZoneMapTable.restaurantId, restaurantId));
            }
        }

        return { rowsAffected: 1 };
    });
}

export const getRestaurantService = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantTable.$inferSelect, boolean>> & {
        address?: Partial<Record<keyof typeof restaurantAddressTable.$inferSelect, boolean>>
    } & {
        deliveryZones?: Partial<Record<keyof typeof restaurantDeliveryZoneMapTable.$inferSelect, boolean>>
    }
) => {
    console.log('columns', columns);
    return await db.query.restaurantTable.findFirst({
        where: eq(restaurantTable.id, restaurantId),
        columns: columns,
        with: {
            ...(columns?.address && {
                address: {
                    columns: columns.address
                }
            }),
            ...(columns?.deliveryZones && {
                deliveryZones: {
                    columns: columns.deliveryZones
                }
            })
        }
    })
}


