import { eq } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { teamTable, teamUserMapTable, TEAM_PERMISSIONS } from '../../../../db/schema/team.schema';
import { userTable } from '../../../../db/schema/auth.schema';
import { websitesTable } from '../../../../db/schema/website.schema';
import { hasTeamPermission_Service } from '../../team/_service_utils/hasTeamPermission_Service';
import { KNOWN_ERROR } from '../../../../types/errors';
import { redactEmail } from '../../../../utils/redactEmail';

/**
 * Service to get all members of a website's team
 * @param websiteId - The ID of the website
 * @param requestingUserId - The ID of the user making the request (for permission check)
 * @returns Array of team members with their details
 */
export const getWebsiteTeamMembers_Service = async (websiteId: string, requestingUserId: string) => {
    // Get the website to find its ownerTeamId
    const website = await db.select({
        id: websitesTable.id,
        ownerTeamId: websitesTable.ownerTeamId,
    })
        .from(websitesTable)
        .where(eq(websitesTable.id, websiteId))
        .then(results => results[0]);

    if (!website) {
        throw new KNOWN_ERROR("Website not found", "WEBSITE_NOT_FOUND");
    }

    const teamId = website.ownerTeamId;

    // Check if the requesting user has permission to view this team
    const hasPermission = await hasTeamPermission_Service(
        requestingUserId,
        teamId,
        [TEAM_PERMISSIONS.FULL_ACCESS, TEAM_PERMISSIONS.WEBSITE_MANAGER, TEAM_PERMISSIONS.TEAM_MANAGER]
    );

    if (!hasPermission) {
        throw new KNOWN_ERROR("Unauthorized to view team members", "UNAUTHORIZED_TO_VIEW_TEAM_MEMBERS");
    }

    // Get the team owner
    const team = await db.select({
        id: teamTable.id,
        ownerUserId: teamTable.ownerUserId,
    })
        .from(teamTable)
        .where(eq(teamTable.id, teamId))
        .then(results => results[0]);

    if (!team) {
        throw new KNOWN_ERROR("Team not found", "TEAM_NOT_FOUND");
    }

    // Get all team members
    const members = await db
        .select({
            userId: userTable.id,
            name: userTable.name,
            email: userTable.email,
            pictureUrl: userTable.pictureUrl,
            permissions: teamUserMapTable.permissions,
            isOwner: eq(userTable.id, team.ownerUserId)
        })
        .from(teamUserMapTable)
        .innerJoin(
            userTable,
            eq(teamUserMapTable.userId, userTable.id)
        )
        .where(
            eq(teamUserMapTable.teamId, teamId)
        );

    return members
        .map(member => ({
            ...member,
            email: redactEmail(member.email)
        }));
}; 