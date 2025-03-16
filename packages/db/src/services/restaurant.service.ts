import db from "@db/drizzle";
import { restaurantTable } from "@db/schema/restaurant.schema";
import { createTeamTransactional_Service, isAdminCheck } from "./team.service";
import type { TEAM_PERMISSIONS } from "@lib/consts";
import { eq } from "drizzle-orm";

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