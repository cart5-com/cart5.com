import db from "@db/drizzle";
import { storeAddressTable, storeTable, storeOpenHoursTable, storeMenuTable, storePaymentMethodsTable, storeTaxSettingsTable, storeDeliveryZoneMapTable } from "@db/schema/store.schema";
import { createTeamTransactional_Service, createTeamWithoutOwner_Service, isAdminCheck } from "./team.service";
import type { TEAM_PERMISSIONS } from "@lib/consts";
import { eq, or, desc, inArray } from "drizzle-orm";
import { teamUserMapTable } from "@db/schema/team.schema";
import type { InferInsertModel } from "drizzle-orm";

export const getStoreData_Service = async (
    storeId: string
) => {
    return await db.query.storeTable.findFirst({
        where: eq(storeTable.id, storeId),
        columns: {
            id: true,
            name: true,
        },
        with: {
            menu: {
                columns: {
                    menuRoot: true
                }
            },
            taxSettings: true,
            // address: true,
            // openHours: true,
            // paymentMethods: true,
            // deliveryZones: true,
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
    return await db.insert(storeAddressTable)
        .values({ ...data, storeId: storeId })
        .onConflictDoUpdate({
            target: storeAddressTable.storeId,
            set: data
        });
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
    return (await db.insert(storeOpenHoursTable)
        .values({ ...data, storeId: storeId })
        .onConflictDoUpdate({
            target: storeOpenHoursTable.storeId,
            set: data
        }));
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
    return await db.insert(storeMenuTable)
        .values({ ...data, storeId: storeId })
        .onConflictDoUpdate({
            target: storeMenuTable.storeId,
            set: data
        });
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
    return await db.insert(storePaymentMethodsTable)
        .values({ ...data, storeId: storeId })
        .onConflictDoUpdate({
            target: storePaymentMethodsTable.storeId,
            set: data
        });
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
    return await db.insert(storeTaxSettingsTable)
        .values({ ...data, storeId: storeId })
        .onConflictDoUpdate({
            target: storeTaxSettingsTable.storeId,
            set: data
        });
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
    return await db.insert(storeDeliveryZoneMapTable)
        .values({ ...data, storeId: storeId })
        .onConflictDoUpdate({
            target: storeDeliveryZoneMapTable.storeId,
            set: data
        });
}

export const updateStore_Service = async (
    storeId: string,
    storeData: Partial<InferInsertModel<typeof storeTable>>
) => {
    return await db.update(storeTable)
        .set(storeData)
        .where(eq(storeTable.id, storeId))
}

export const createStore_Service = async (
    userId: string,
    name: string,
    supportTeamId: string | null,
    isUserMemberOfSupportTeam: boolean,
    storeId?: string
) => {
    return await db.transaction(async (tx) => {

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