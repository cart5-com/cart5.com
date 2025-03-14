import { eq } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { websiteDomainMapTable, websitesTable } from '../../../../db/schema/website.schema';
import { teamTable } from '../../../../db/schema/team.schema';

/**
 * Get the team associated with a hostname
 * @param hostname - The hostname to look up
 * @returns The team object or null if not found
 */
export const getSupportTeamByHostname_Service = async (hostname: string) => {
    const result = await db
        .select({
            teamId: teamTable.id,
            websiteId: websitesTable.id,
            name: websitesTable.name,
            defaultHostname: websitesTable.defaultHostname,
            // ownerUserId: teamTable.ownerUserId
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
        .then(results => results[0] || null);

    return result ? result : null;
}