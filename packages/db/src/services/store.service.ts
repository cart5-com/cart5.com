import db from "@db/drizzle";
import {
    storeAddressTable,
    storeTable,
    storeOpenHoursTable,
    storeMenuTable,
    storePaymentMethodsTable,
    storeTaxSettingsTable,
    storeDeliveryZoneMapTable,
    storeServiceFeesTable,
    storeStripeConnectSettingsTable,
    storeAsAStripeCustomerTable
} from "@db/schema/store.schema";
import { createTeamTransactional_Service, createTeamWithoutOwner_Service, isAdminCheck } from "./team.service";
import type { TEAM_PERMISSIONS } from "@lib/consts";
import { eq, or, desc, inArray } from "drizzle-orm";
import { teamUserMapTable } from "@db/schema/team.schema";
import type { InferInsertModel } from "drizzle-orm";
import { markStoreAsUpdated } from "@db/cache_json/store.cache_json";

export const getStoreData_Service = async (
    storeId: string
) => {
    return await db.query.storeTable.findFirst({
        where: eq(storeTable.id, storeId),
        columns: {
            id: true,
            name: true,
            defaultPhoneNumber: true,
            extraPhoneNumbers: true,
            offersPickup: true,
            defaultEstimatedPickupTime: true,
            offersDelivery: true,
            defaultEstimatedDeliveryTime: true,
            cuisines: true,
        },
        with: {
            address: {
                columns: {
                    address1: true,
                    address2: true,
                    city: true,
                    state: true,
                    postalCode: true,
                    country: true,
                    lat: true,
                    lng: true,
                }
            },
            menu: {
                columns: {
                    menuRoot: true
                }
            },
            serviceFees: {
                columns: {
                    calculationType: true,
                    tolerableServiceFeeRate: true,
                    offerDiscountIfPossible: true,
                    customServiceFees: true,
                }
            },
            taxSettings: {
                columns: {
                    currency: true,
                    currencySymbol: true,
                    salesTaxType: true,
                    taxCategories: true,
                    taxName: true,
                    taxRateForDelivery: true,
                    taxRateForServiceFees: true,
                }
            },
            deliveryZones: {
                columns: {
                    zones: true,
                }
            },
            openHours: {
                columns: {
                    timezone: true,
                    defaultOpenHours: true,
                    deliveryHours: true,
                    pickupHours: true,
                }
            },
            paymentMethods: {
                columns: {
                    defaultPaymentMethods: true,
                    deliveryPaymentMethods: true,
                    pickupPaymentMethods: true,
                }
            },
            stripeSettings: {
                columns: {
                    isStripeEnabled: true,
                    stripeRatePerOrder: true,
                    stripeFeePerOrder: true,
                    whoPaysStripeFee: true,
                }
            },
            asStripeCustomer: {
                columns: {
                    hasChargablePaymentMethod: true,
                }
            }
        }
    });
}

export const getStore_Service = async (
    storeId: string,
    columns?: Partial<Record<keyof typeof storeTable.$inferSelect, boolean>>
) => {
    // https://orm.drizzle.team/docs/rqb
    return await db.query.storeTable.findFirst({
        where: eq(storeTable.id, storeId),
        columns: columns,
        /*/
        // Partial fields select
        // extras: {
        //     loweredName: sql`lower(${storeAddressTable.name})`.as('lowered_name'),
        //     contentLength: (sql<number>`length(${storeAddressTable.name})`).as('content_length'),
        // },
        // orderBy: [asc(storeAddressTable.id)],
        // offset is only available for top level query.
        // offset: 2, // correct ✅
        // limit: 1,
        // orderBy: [desc(storeAddressTable.created_at_ts)],
        // with: {
        //     address: {
        //         orderBy: (address, { desc }) => [desc(address.id)],
        //         offset: 2,
        //         limit: 1,
        //         columns: {
        //             address1: true,
        //         }
        //     }
        // }
        /*/
    });
}


export const getStoreStripeConnectSettings_Service = async (
    storeId: string,
    columns?: Partial<Record<keyof typeof storeStripeConnectSettingsTable.$inferSelect, boolean>>
) => {
    return await db.query.storeStripeConnectSettingsTable.findFirst({
        where: eq(storeStripeConnectSettingsTable.storeId, storeId),
        columns: columns,
    });
}
export const updateStoreStripeConnectSettings_Service = async (
    storeId: string,
    data: Partial<InferInsertModel<typeof storeStripeConnectSettingsTable>>
) => {
    const result = await db.insert(storeStripeConnectSettingsTable)
        .values({ ...data, storeId: storeId })
        .onConflictDoUpdate({
            target: storeStripeConnectSettingsTable.storeId,
            set: data
        });
    await markStoreAsUpdated(storeId);
    return result;
}


export const getStoreAsAStripeCustomer_Service = async (
    storeId: string,
    columns?: Partial<Record<keyof typeof storeAsAStripeCustomerTable.$inferSelect, boolean>>
) => {
    return await db.query.storeAsAStripeCustomerTable.findFirst({
        where: eq(storeAsAStripeCustomerTable.storeId, storeId),
        columns: columns,
    });
}

export const updateStoreAsAStripeCustomer_Service = async (
    storeId: string,
    data: Partial<InferInsertModel<typeof storeAsAStripeCustomerTable>>
) => {
    const result = await db.insert(storeAsAStripeCustomerTable)
        .values({ ...data, storeId: storeId })
        .onConflictDoUpdate({
            target: storeAsAStripeCustomerTable.storeId,
            set: data
        });
    return result;
}

export const getStoreAddress_Service = async (
    storeId: string,
    columns?: Partial<Record<keyof typeof storeAddressTable.$inferSelect, boolean>>
) => {
    return await db.query.storeAddressTable.findFirst({
        where: eq(storeAddressTable.storeId, storeId),
        columns: columns,
    });
}

export const updateStoreAddress_Service = async (
    storeId: string,
    data: Partial<InferInsertModel<typeof storeAddressTable>>
) => {
    const result = await db.insert(storeAddressTable)
        .values({ ...data, storeId: storeId })
        .onConflictDoUpdate({
            target: storeAddressTable.storeId,
            set: data
        });

    await markStoreAsUpdated(storeId);
    return result;
}

export const getStoreOpenHours_Service = async (
    storeId: string,
    columns?: Partial<Record<keyof typeof storeOpenHoursTable.$inferSelect, boolean>>
) => {
    return await db.query.storeOpenHoursTable.findFirst({
        where: eq(storeOpenHoursTable.storeId, storeId),
        columns: columns,
    });
}

export const updateStoreOpenHours_Service = async (
    storeId: string,
    data: Partial<InferInsertModel<typeof storeOpenHoursTable>>
) => {
    const result = await db.insert(storeOpenHoursTable)
        .values({ ...data, storeId: storeId })
        .onConflictDoUpdate({
            target: storeOpenHoursTable.storeId,
            set: data
        });

    await markStoreAsUpdated(storeId);
    return result;
}

export const getStoreMenu_Service = async (
    storeId: string,
    columns?: Partial<Record<keyof typeof storeMenuTable.$inferSelect, boolean>>
) => {
    return await db.query.storeMenuTable.findFirst({
        where: eq(storeMenuTable.storeId, storeId),
        columns: columns,
    });
}

export const updateStoreMenu_Service = async (
    storeId: string,
    data: Partial<InferInsertModel<typeof storeMenuTable>>
) => {
    const result = await db.insert(storeMenuTable)
        .values({ ...data, storeId: storeId })
        .onConflictDoUpdate({
            target: storeMenuTable.storeId,
            set: data
        });

    await markStoreAsUpdated(storeId);
    return result;
}

export const getStoreServiceFees_Service = async (
    storeId: string,
    columns?: Partial<Record<keyof typeof storeServiceFeesTable.$inferSelect, boolean>>
) => {
    return await db.query.storeServiceFeesTable.findFirst({
        where: eq(storeServiceFeesTable.storeId, storeId),
        columns: columns,
    });
}

export const updateStoreServiceFees_Service = async (
    storeId: string,
    data: Partial<InferInsertModel<typeof storeServiceFeesTable>>
) => {
    const result = await db.insert(storeServiceFeesTable)
        .values({ ...data, storeId: storeId })
        .onConflictDoUpdate({
            target: storeServiceFeesTable.storeId,
            set: data
        });

    await markStoreAsUpdated(storeId);
    return result;
}

export const getStorePaymentMethods_Service = async (
    storeId: string,
    columns?: Partial<Record<keyof typeof storePaymentMethodsTable.$inferSelect, boolean>>
) => {
    return await db.query.storePaymentMethodsTable.findFirst({
        where: eq(storePaymentMethodsTable.storeId, storeId),
        columns: columns,
    });
}

export const updateStorePaymentMethods_Service = async (
    storeId: string,
    data: Partial<InferInsertModel<typeof storePaymentMethodsTable>>
) => {
    const result = await db.insert(storePaymentMethodsTable)
        .values({ ...data, storeId: storeId })
        .onConflictDoUpdate({
            target: storePaymentMethodsTable.storeId,
            set: data
        });

    await markStoreAsUpdated(storeId);
    return result;
}

export const getStoreTaxSettings_Service = async (
    storeId: string,
    columns?: Partial<Record<keyof typeof storeTaxSettingsTable.$inferSelect, boolean>>
) => {
    return await db.query.storeTaxSettingsTable.findFirst({
        where: eq(storeTaxSettingsTable.storeId, storeId),
        columns: columns,
    });
}

export const updateStoreTaxSettings_Service = async (
    storeId: string,
    data: Partial<InferInsertModel<typeof storeTaxSettingsTable>>
) => {
    const result = await db.insert(storeTaxSettingsTable)
        .values({ ...data, storeId: storeId })
        .onConflictDoUpdate({
            target: storeTaxSettingsTable.storeId,
            set: data
        });

    await markStoreAsUpdated(storeId);
    return result;
}

export const getStoreDeliveryZones_Service = async (
    storeId: string,
    columns?: Partial<Record<keyof typeof storeDeliveryZoneMapTable.$inferSelect, boolean>>
) => {
    return await db.query.storeDeliveryZoneMapTable.findFirst({
        where: eq(storeDeliveryZoneMapTable.storeId, storeId),
        columns: columns,
    });
}

export const updateStoreDeliveryZones_Service = async (
    storeId: string,
    data: Partial<InferInsertModel<typeof storeDeliveryZoneMapTable>>
) => {
    const result = await db.insert(storeDeliveryZoneMapTable)
        .values({ ...data, storeId: storeId })
        .onConflictDoUpdate({
            target: storeDeliveryZoneMapTable.storeId,
            set: data
        });

    await markStoreAsUpdated(storeId);
    return result;
}

export const updateStore_Service = async (
    storeId: string,
    storeData: Partial<InferInsertModel<typeof storeTable>>
) => {
    const result = await db.update(storeTable)
        .set(storeData)
        .where(eq(storeTable.id, storeId));

    await markStoreAsUpdated(storeId);
    return result;
}

export const createStore_Service = async (
    userId: string,
    name: string,
    supportTeamId: string | null,
    isUserMemberOfSupportTeam: boolean,
    storeId?: string
) => {

    const store = await db.transaction(async (tx) => {

        const teamId = isUserMemberOfSupportTeam
            ? await createTeamWithoutOwner_Service('STORE', tx)
            : await createTeamTransactional_Service(userId, 'STORE', tx);

        const values = {
            name: name,
            ownerTeamId: teamId,
            supportTeamId: supportTeamId
        }
        if (storeId) {
            (values as any).id = storeId;
        }
        const store = await tx.insert(storeTable)
            .values(values)
            .returning({
                id: storeTable.id,
                ownerTeamId: storeTable.ownerTeamId,
                name: storeTable.name
            });

        return store[0];
    })

    if (store) {
        await markStoreAsUpdated(store.id);
    }

    return store;
}

export const isUserStoreAdmin = async function (
    userId: string,
    storeId: string,
    permissions: (typeof TEAM_PERMISSIONS)[keyof typeof TEAM_PERMISSIONS][]
) {
    // First, get the store's owner and support team IDs
    const store = await db.select({
        ownerTeamId: storeTable.ownerTeamId,
        supportTeamId: storeTable.supportTeamId
    })
        .from(storeTable)
        .where(eq(storeTable.id, storeId))
        .then(results => results[0]);

    if (!store) {
        return false;
    }
    return await isAdminCheck(
        userId,
        store.ownerTeamId,
        store.supportTeamId,
        permissions
    );
}

export const getAllStoresThatUserHasAccessTo = async (userId: string) => {
    const userTeams = await db.select()
        .from(teamUserMapTable)
        .where(eq(teamUserMapTable.userId, userId));

    const stores = await db.select({
        id: storeTable.id,
        name: storeTable.name,
        address1: storeAddressTable.address1
    })
        .from(storeTable)
        .leftJoin(
            storeAddressTable,
            eq(storeTable.id, storeAddressTable.storeId)
        )
        .where(
            or(
                inArray(storeTable.supportTeamId, userTeams.map(team => team.teamId)),
                inArray(storeTable.ownerTeamId, userTeams.map(team => team.teamId))
            )
        )
        .orderBy(desc(storeTable.created_at_ts));

    return stores;
}