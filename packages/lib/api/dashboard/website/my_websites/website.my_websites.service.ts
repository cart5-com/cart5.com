import { eq, inArray, or } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { websitesTable } from '../../../../db/schema/website.schema';
import { teamUserMapTable } from '../../../../db/schema/team.schema';

/**
 * Service to get all websites the user has access to
 * @param userId - The ID of the user
 * @returns Array of websites the user has access to
 */
export const getMyWebsites_Service = async (userId: string) => {
    const myTeams = await db.select()
        .from(teamUserMapTable)
        .where(eq(teamUserMapTable.userId, userId));

    const websites = await db.select({
        id: websitesTable.id,
        name: websitesTable.name
    })
        .from(websitesTable)
        .where(
            or(
                inArray(websitesTable.supportTeamId, myTeams.map(team => team.teamId)),
                inArray(websitesTable.ownerTeamId, myTeams.map(team => team.teamId))
            )
        );

    return websites;
} 