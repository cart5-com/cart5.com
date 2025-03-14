import { eq, or } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { teamTable, teamUserMapTable } from '../../../../db/schema/team.schema';
import { websitesTable } from '../../../../db/schema/website.schema';
import { restaurantTable } from '../../../../db/schema/restaurant.schema';
import { getSupportTeamByHostname_Service } from '../../website_domains/_service_utils/getTeamByHostname_Service';

/**
 * Service to get all teams the user has access to
 * @param userId - The ID of the user
 * @returns Array of teams the user has access to with associated website names and restaurant names
 */
export const getMyTeams_Service = async (
    userId: string,
    hostname: string
) => {
    return {
        myTeams: await getUserTeams_Service(userId),
        hostnameSupportTeam: await getSupportTeamByHostname_Service(hostname)
    };

}


export const getUserTeams_Service = async (userId: string) => {
    return await db
        .select({
            teamId: teamTable.id,
            websiteId: websitesTable.id,
            websiteName: websitesTable.name,
            defaultHostname: websitesTable.defaultHostname,
            restaurantId: restaurantTable.id,
            restaurantName: restaurantTable.name,
            // ownerUserId: teamTable.ownerUserId,
            // isOwner: eq(teamTable.ownerUserId, userId),
            // permissions: teamUserMapTable.permissions
        })
        .from(teamTable)
        .innerJoin(
            teamUserMapTable,
            eq(teamTable.id, teamUserMapTable.teamId)
        )
        .leftJoin(
            websitesTable,
            eq(teamTable.id, websitesTable.ownerTeamId)
        )
        .leftJoin(
            restaurantTable,
            or(
                eq(teamTable.id, restaurantTable.ownerTeamId),
                eq(teamTable.id, restaurantTable.supportTeamId)
            )
        )
        .where(
            eq(teamUserMapTable.userId, userId)
        );
}