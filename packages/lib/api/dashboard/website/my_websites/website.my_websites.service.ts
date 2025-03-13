import { eq, or, and } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { websiteDomainMapTable, websitesTable } from '../../../../db/schema/website.schema';
import { teamTable, teamUserMapTable } from '../../../../db/schema/team.schema';

/**
 * Service to get all websites the user has access to
 * @param userId - The ID of the user
 * @returns Array of websites the user has access to
 */
export const getMyWebsites_Service = async (userId: string, host: string) => {
    // First, get the current team ID from the hostname
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
        .where(eq(websiteDomainMapTable.hostname, host))
        .limit(1);

    // Get websites where user has permission and that belong to the current team
    const websites = await db
        .select({
            id: websitesTable.id,
            name: websitesTable.name,
            defaultHostname: websitesTable.defaultHostname,
            ownerTeamId: websitesTable.ownerTeamId,
            supportTeamId: websitesTable.supportTeamId
        })
        .from(teamUserMapTable)
        .innerJoin(
            websitesTable,
            or(
                eq(websitesTable.supportTeamId, teamUserMapTable.teamId),
                eq(websitesTable.ownerTeamId, teamUserMapTable.teamId)
            )
        )
        .innerJoin(
            teamTable,
            eq(teamUserMapTable.teamId, teamTable.id)
        )
        .where(
            and(
                eq(teamUserMapTable.userId, userId),
                or(
                    eq(websitesTable.ownerTeamId, currentTeamSubquery),
                    eq(websitesTable.supportTeamId, currentTeamSubquery)
                )
            )
        )
        .groupBy(websitesTable.id);

    return websites;
}