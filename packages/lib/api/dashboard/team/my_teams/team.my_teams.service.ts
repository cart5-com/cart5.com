import { eq } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { teamTable, teamUserMapTable } from '../../../../db/schema/team.schema';
import { websitesTable } from '../../../../db/schema/website.schema';
import { getTeamByHostname_Service } from '../../website_domains/_service_utils/getTeamByHostname_Service';
import type { Context } from 'hono';

/**
 * Service to get all teams the user has access to
 * @param userId - The ID of the user
 * @returns Array of teams the user has access to with associated website names
 */
export const getMyTeams_Service = async (
    userId: string,
    c: Context
) => {
    const hostname = c.req.header()['host'];
    const myTeams = await db
        .select({
            teamId: teamTable.id,
            websiteId: websitesTable.id,
            name: websitesTable.name,
            defaultHostname: websitesTable.defaultHostname,
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
        .where(
            eq(teamUserMapTable.userId, userId)
        );

    return {
        myTeams,
        hostnameTeam: await getTeamByHostname_Service(hostname)
    };

} 