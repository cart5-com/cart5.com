import { eq, or, and } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { restaurantAddressTable, restaurantTable } from '../../../../db/schema/restaurant.schema';
import { teamUserMapTable, teamTable } from '../../../../db/schema/team.schema';
import { websiteDomainMapTable, websitesTable } from '../../../../db/schema/website.schema';

export const getMyRestaurants_Service = async (userId: string, hostname: string) => {
    // Subquery to get the current team ID from hostname
    const currentTeamSubquery = db
        .select({
            teamId: teamTable.id
        })
        .from(websiteDomainMapTable)
        .innerJoin(
            websitesTable,
            eq(websiteDomainMapTable.websiteId, websitesTable.id)
        )
        .innerJoin(
            teamTable,
            eq(websitesTable.ownerTeamId, teamTable.id)
        )
        .where(eq(websiteDomainMapTable.hostname, hostname))
        .limit(1);

    // Get restaurants where user has permission and that belong to the current team
    const restaurants = await db.select({
        id: restaurantTable.id,
        name: restaurantTable.name,
        address1: restaurantAddressTable.address1,
        supportTeamId: restaurantTable.supportTeamId,
        ownerTeamId: restaurantTable.ownerTeamId
    })
        .from(restaurantTable)
        .leftJoin(
            restaurantAddressTable,
            eq(restaurantTable.id, restaurantAddressTable.restaurantId)
        )
        .innerJoin(
            teamUserMapTable,
            or(
                eq(restaurantTable.supportTeamId, teamUserMapTable.teamId),
                eq(restaurantTable.ownerTeamId, teamUserMapTable.teamId)
            )
        )
        .where(
            and(
                eq(teamUserMapTable.userId, userId),
                or(
                    eq(restaurantTable.ownerTeamId, currentTeamSubquery),
                    eq(restaurantTable.supportTeamId, currentTeamSubquery)
                )
            )
        )
        .groupBy(restaurantTable.id);

    return restaurants;
}