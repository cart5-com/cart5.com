import db from "@db/drizzle";
import { restaurantAddressTable, restaurantTable } from "@db/schema/restaurant.schema";
import { createTeamTransactional_Service, isAdminCheck } from "./team.service";
import type { TEAM_PERMISSIONS } from "@lib/consts";
import { eq, or, desc, inArray } from "drizzle-orm";
import { teamUserMapTable } from "@db/schema/team.schema";

export const createRestaurant_Service = async (userId: string, name: string, supportTeamId: string | null) => {
    return await db.transaction(async (tx) => {
        const teamId = await createTeamTransactional_Service(userId, 'RESTAURANT', tx);

        const restaurant = await tx.insert(restaurantTable).values({
            name: name,
            ownerTeamId: teamId,
            supportTeamId: supportTeamId
        }).returning({ id: restaurantTable.id });

        return restaurant[0].id;
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