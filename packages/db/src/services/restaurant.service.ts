import db from "@db/drizzle";
import { restaurantAddressTable, restaurantTable, restaurantOpenHoursTable, restaurantMenuTable, restaurantPaymentMethodsTable, restaurantTableReservationSettingsTable, restaurantTaxSettingsTable, restaurantScheduledOrdersSettingsTable, restaurantDeliveryZoneMapTable } from "@db/schema/restaurant.schema";
import { createTeamTransactional_Service, createTeamWithoutOwner_Service, isAdminCheck } from "./team.service";
import type { TEAM_PERMISSIONS } from "@lib/consts";
import { eq, or, desc, inArray } from "drizzle-orm";
import { teamUserMapTable } from "@db/schema/team.schema";
import type { InferInsertModel } from "drizzle-orm";

export const getRestaurant_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantTable.$inferSelect, boolean>>
) => {
    // https://orm.drizzle.team/docs/rqb
    return await db.query.restaurantTable.findFirst({
        where: eq(restaurantTable.id, restaurantId),
        columns: columns,
        /*/
        // Partial fields select
        // extras: {
        //     loweredName: sql`lower(${restaurantAddressTable.name})`.as('lowered_name'),
        //     contentLength: (sql<number>`length(${restaurantAddressTable.name})`).as('content_length'),
        // },
        // orderBy: [asc(restaurantAddressTable.id)],
        // offset is only available for top level query.
        // offset: 2, // correct ✅
        // limit: 1,
        // orderBy: [desc(restaurantAddressTable.created_at_ts)],
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

export const getRestaurantAddress_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantAddressTable.$inferSelect, boolean>>
) => {
    return await db.query.restaurantAddressTable.findFirst({
        where: eq(restaurantAddressTable.restaurantId, restaurantId),
        columns: columns,
    });
}

export const updateRestaurantAddress_Service = async (
    restaurantId: string,
    data: Partial<InferInsertModel<typeof restaurantAddressTable>>
) => {
    return await db.insert(restaurantAddressTable)
        .values({ ...data, restaurantId: restaurantId })
        .onConflictDoUpdate({
            target: restaurantAddressTable.restaurantId,
            set: data
        });
}

export const getRestaurantOpenHours_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantOpenHoursTable.$inferSelect, boolean>>
) => {
    return await db.query.restaurantOpenHoursTable.findFirst({
        where: eq(restaurantOpenHoursTable.restaurantId, restaurantId),
        columns: columns,
    });
}

export const updateRestaurantOpenHours_Service = async (
    restaurantId: string,
    data: Partial<InferInsertModel<typeof restaurantOpenHoursTable>>
) => {
    return await db.insert(restaurantOpenHoursTable)
        .values({ ...data, restaurantId: restaurantId })
        .onConflictDoUpdate({
            target: restaurantOpenHoursTable.restaurantId,
            set: data
        });
}

export const getRestaurantMenu_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantMenuTable.$inferSelect, boolean>>
) => {
    return await db.query.restaurantMenuTable.findFirst({
        where: eq(restaurantMenuTable.restaurantId, restaurantId),
        columns: columns,
    });
}

export const updateRestaurantMenu_Service = async (
    restaurantId: string,
    data: Partial<InferInsertModel<typeof restaurantMenuTable>>
) => {
    return await db.insert(restaurantMenuTable)
        .values({ ...data, restaurantId: restaurantId })
        .onConflictDoUpdate({
            target: restaurantMenuTable.restaurantId,
            set: data
        });
}

export const getRestaurantPaymentMethods_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantPaymentMethodsTable.$inferSelect, boolean>>
) => {
    return await db.query.restaurantPaymentMethodsTable.findFirst({
        where: eq(restaurantPaymentMethodsTable.restaurantId, restaurantId),
        columns: columns,
    });
}

export const updateRestaurantPaymentMethods_Service = async (
    restaurantId: string,
    data: Partial<InferInsertModel<typeof restaurantPaymentMethodsTable>>
) => {
    return await db.insert(restaurantPaymentMethodsTable)
        .values({ ...data, restaurantId: restaurantId })
        .onConflictDoUpdate({
            target: restaurantPaymentMethodsTable.restaurantId,
            set: data
        });
}

export const getRestaurantTableReservationSettings_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantTableReservationSettingsTable.$inferSelect, boolean>>
) => {
    return await db.query.restaurantTableReservationSettingsTable.findFirst({
        where: eq(restaurantTableReservationSettingsTable.restaurantId, restaurantId),
        columns: columns,
    });
}

export const updateRestaurantTableReservationSettings_Service = async (
    restaurantId: string,
    data: Partial<InferInsertModel<typeof restaurantTableReservationSettingsTable>>
) => {
    return await db.insert(restaurantTableReservationSettingsTable)
        .values({ ...data, restaurantId: restaurantId })
        .onConflictDoUpdate({
            target: restaurantTableReservationSettingsTable.restaurantId,
            set: data
        });
}

export const getRestaurantTaxSettings_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantTaxSettingsTable.$inferSelect, boolean>>
) => {
    return await db.query.restaurantTaxSettingsTable.findFirst({
        where: eq(restaurantTaxSettingsTable.restaurantId, restaurantId),
        columns: columns,
    });
}

export const updateRestaurantTaxSettings_Service = async (
    restaurantId: string,
    data: Partial<InferInsertModel<typeof restaurantTaxSettingsTable>>
) => {
    return await db.insert(restaurantTaxSettingsTable)
        .values({ ...data, restaurantId: restaurantId })
        .onConflictDoUpdate({
            target: restaurantTaxSettingsTable.restaurantId,
            set: data
        });
}

export const getRestaurantScheduledOrdersSettings_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantScheduledOrdersSettingsTable.$inferSelect, boolean>>
) => {
    return await db.query.restaurantScheduledOrdersSettingsTable.findFirst({
        where: eq(restaurantScheduledOrdersSettingsTable.restaurantId, restaurantId),
        columns: columns,
    });
}

export const updateRestaurantScheduledOrdersSettings_Service = async (
    restaurantId: string,
    data: Partial<InferInsertModel<typeof restaurantScheduledOrdersSettingsTable>>
) => {
    return await db.insert(restaurantScheduledOrdersSettingsTable)
        .values({ ...data, restaurantId: restaurantId })
        .onConflictDoUpdate({
            target: restaurantScheduledOrdersSettingsTable.restaurantId,
            set: data
        });
}

export const getRestaurantDeliveryZones_Service = async (
    restaurantId: string,
    columns?: Partial<Record<keyof typeof restaurantDeliveryZoneMapTable.$inferSelect, boolean>>
) => {
    return await db.query.restaurantDeliveryZoneMapTable.findFirst({
        where: eq(restaurantDeliveryZoneMapTable.restaurantId, restaurantId),
        columns: columns,
    });
}

export const updateRestaurantDeliveryZones_Service = async (
    restaurantId: string,
    data: Partial<InferInsertModel<typeof restaurantDeliveryZoneMapTable>>
) => {
    return await db.insert(restaurantDeliveryZoneMapTable)
        .values({ ...data, restaurantId: restaurantId })
        .onConflictDoUpdate({
            target: restaurantDeliveryZoneMapTable.restaurantId,
            set: data
        });
}

export const updateRestaurant_Service = async (
    restaurantId: string,
    restaurantData: Partial<InferInsertModel<typeof restaurantTable>>
) => {
    return await db.update(restaurantTable)
        .set(restaurantData)
        .where(eq(restaurantTable.id, restaurantId))
}

export const createRestaurant_Service = async (
    userId: string,
    name: string,
    supportTeamId: string | null,
    isUserMemberOfSupportTeam: boolean
) => {
    return await db.transaction(async (tx) => {

        const teamId = isUserMemberOfSupportTeam
            ? await createTeamWithoutOwner_Service('RESTAURANT', tx)
            : await createTeamTransactional_Service(userId, 'RESTAURANT', tx);

        const restaurant = await tx.insert(restaurantTable).values({
            name: name,
            ownerTeamId: teamId,
            supportTeamId: supportTeamId
        }).returning({
            id: restaurantTable.id,
            ownerTeamId: restaurantTable.ownerTeamId,
            name: restaurantTable.name
        });

        return restaurant[0];
    })
}

export const isUserRestaurantAdmin = async function (
    userId: string,
    restaurantId: string,
    permissions: (typeof TEAM_PERMISSIONS)[keyof typeof TEAM_PERMISSIONS][]
) {
    // First, get the restaurant's owner and support team IDs
    const restaurant = await db.select({
        ownerTeamId: restaurantTable.ownerTeamId,
        supportTeamId: restaurantTable.supportTeamId
    })
        .from(restaurantTable)
        .where(eq(restaurantTable.id, restaurantId))
        .then(results => results[0]);

    if (!restaurant) {
        return false;
    }
    return await isAdminCheck(
        userId,
        restaurant.ownerTeamId,
        restaurant.supportTeamId,
        permissions
    );
}

export const getAllRestaurantsThatUserHasAccessTo = async (userId: string) => {
    const userTeams = await db.select()
        .from(teamUserMapTable)
        .where(eq(teamUserMapTable.userId, userId));

    const restaurants = await db.select({
        id: restaurantTable.id,
        name: restaurantTable.name,
        address1: restaurantAddressTable.address1
    })
        .from(restaurantTable)
        .leftJoin(
            restaurantAddressTable,
            eq(restaurantTable.id, restaurantAddressTable.restaurantId)
        )
        .where(
            or(
                inArray(restaurantTable.supportTeamId, userTeams.map(team => team.teamId)),
                inArray(restaurantTable.ownerTeamId, userTeams.map(team => team.teamId))
            )
        )
        .orderBy(desc(restaurantTable.created_at_ts));

    return restaurants;
}