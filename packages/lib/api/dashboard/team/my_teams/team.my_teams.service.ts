import { eq } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { teamTable, teamUserMapTable } from '../../../../db/schema/team.schema';
import { websitesTable } from '../../../../db/schema/website.schema';

/**
 * Service to get all teams the user has access to
 * @param userId - The ID of the user
 * @returns Array of teams the user has access to with associated website names
 */
export const getMyTeams_Service = async (userId: string) => {
    return await db
        .select({
            id: teamTable.id,
            name: websitesTable.name,
            ownerUserId: teamTable.ownerUserId,
            isOwner: eq(teamTable.ownerUserId, userId),
            permissions: teamUserMapTable.permissions
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
        .where(
            eq(teamUserMapTable.userId, userId)
        );
} 