import { eq, and } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { TEAM_PERMISSIONS, teamInvitationsTable } from '../../../../db/schema/team.schema';
import { websitesTable } from '../../../../db/schema/website.schema';
import { hasTeamPermission_Service } from '../../team/_service_utils/hasTeamPermission_Service';
import { KNOWN_ERROR } from '../../../../types/errors';
import { signJwtAndEncrypt } from '../../../../auth/utils/jwt';
import { getEnvVariable } from '../../../../utils/getEnvVariable';
import { ENFORCE_HOSTNAME_CHECKS } from '../../../../auth/enforceHostnameChecks';
import { sendInvitationEmail } from '../../../../auth/utils/email';

/**
 * Service to invite a user to a website's team
 * @param websiteId - The ID of the website
 * @param requestingUserId - The ID of the user making the request (for permission check)
 * @param email - Email of the user to invite
 * @param permissions - Array of permissions to grant to the invited user
 * @returns Created invitation details
 */
export const inviteTeamMember_Service = async (
    websiteId: string,
    requestingUserId: string,
    email: string,
    permissions: string[],
    host: string
) => {
    // Get the website to find its ownerTeamId
    const website = await db.select({
        id: websitesTable.id,
        name: websitesTable.name,
        ownerTeamId: websitesTable.ownerTeamId,
    })
        .from(websitesTable)
        .where(eq(websitesTable.id, websiteId))
        .then(results => results[0]);

    if (!website) {
        throw new KNOWN_ERROR("Website not found", "WEBSITE_NOT_FOUND");
    }

    const teamId = website.ownerTeamId;

    // Check if the requesting user has permission to manage this team
    const hasPermission = await hasTeamPermission_Service(
        requestingUserId,
        teamId,
        [TEAM_PERMISSIONS.FULL_ACCESS, TEAM_PERMISSIONS.TEAM_MANAGER]
    );

    if (!hasPermission) {
        throw new KNOWN_ERROR("Unauthorized to invite team members", "UNAUTHORIZED_TO_INVITE_TEAM_MEMBERS");
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await db.select({
        id: teamInvitationsTable.id,
        createdAt: teamInvitationsTable.created_at_ts,
    })
        .from(teamInvitationsTable)
        .where(
            and(
                eq(teamInvitationsTable.email, email),
                eq(teamInvitationsTable.teamId, teamId),
                eq(teamInvitationsTable.status, "PENDING")
            )
        )
        .then(results => results[0]);

    if (existingInvitation) {
        throw new KNOWN_ERROR("Invitation already sent to this email", "INVITATION_ALREADY_SENT");
    }

    // Create the invitation
    const invitation = await db.insert(teamInvitationsTable)
        .values({
            teamId,
            teamName: website.name,
            inviterId: requestingUserId,
            email,
            permissions,
            status: "PENDING",
        })
        .returning()
        .then(results => results[0]);

    const invitationLink = await generateInvitationLink(invitation.id, host);
    await sendInvitationEmail(email, invitationLink, website.name);

    return "SUCCESS";
};

export const generateInvitationLink = async (invitationId: string, host: string) => {
    const token = await signJwtAndEncrypt<InvitationLinkPayload>(
        getEnvVariable('JWT_PRIVATE_KEY'),
        getEnvVariable('ENCRYPTION_KEY'),
        {
            nonce: crypto.randomUUID(),
            invitationId,
        },
        100800 // 1 week in minutes
    );
    // TODO: convert all /dash/... to /dashboard/
    const protocol = ENFORCE_HOSTNAME_CHECKS ? 'https' : 'http';
    return `${protocol}://${host}/dash/team_invitation?token=${token}`;;
};

export type InvitationLinkPayload = {
    nonce: string;
    invitationId: string;
}