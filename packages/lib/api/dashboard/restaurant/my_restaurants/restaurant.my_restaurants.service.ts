import { eq, or, and, inArray } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { restaurantAddressTable, restaurantTable } from '../../../../db/schema/restaurant.schema';
import { teamUserMapTable, teamTable } from '../../../../db/schema/team.schema';
import { websiteDomainMapTable, websitesTable } from '../../../../db/schema/website.schema';



export const getMyRestaurants_Service_Old = async (userId: string) => {
    const myTeams = await db.select()
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
                inArray(restaurantTable.supportTeamId, myTeams.map(team => team.teamId)),
                inArray(restaurantTable.ownerTeamId, myTeams.map(team => team.teamId))
            )
        );

    return restaurants;
}

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

    // Get the website ID from hostname
    const websiteSubquery = db
        .select({
            websiteId: websitesTable.id
        })
        .from(websiteDomainMapTable)
        .innerJoin(
            websitesTable,
            eq(websiteDomainMapTable.websiteId, websitesTable.id)
        )
        .where(eq(websiteDomainMapTable.hostname, hostname))
        .limit(1);

    // Get restaurants where user has permission and that belong to the current team
    // or have the current website as their default website
    const restaurants = await db.select({
        id: restaurantTable.id,
        name: restaurantTable.name,
        address1: restaurantAddressTable.address1,
        // defaultWebsiteId: restaurantTable.defaultWebsiteId
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
                    eq(restaurantTable.supportTeamId, currentTeamSubquery),
                    eq(restaurantTable.defaultWebsiteId, websiteSubquery)
                )
            )
        )
        .groupBy(restaurantTable.id);

    return restaurants;
}