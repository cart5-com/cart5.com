import db from "@db/drizzle";
import { teamInvitationsTable, teamTable, teamUserMapTable } from "@db/schema/team.schema";
import { TEAM_PERMISSIONS } from "@lib/consts";
import { eq, and, or } from "drizzle-orm";
import { websiteDomainMapTable, websitesTable } from "@db/schema/website.schema";
import { userTable } from "@db/schema/auth.schema";
import { restaurantTable } from "@db/schema/restaurant.schema";

export const getTeam_Service = async (
    teamId: string,
    columns?: Partial<Record<keyof typeof teamTable.$inferSelect, boolean>>
) => {
    return await db.query.teamTable.findFirst({
        where: eq(teamTable.id, teamId),
        columns: columns,
    });
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

export const getTeamMembers_Service = async (
    teamId: string,
    teamOwnerUserId: string
) => {
    return await db
        .select({
            userId: userTable.id,
            name: userTable.name,
            email: userTable.email,
            pictureUrl: userTable.pictureUrl,
            permissions: teamUserMapTable.permissions,
            isOwner: eq(userTable.id, teamOwnerUserId)
        })
        .from(teamUserMapTable)
        .innerJoin(
            userTable,
            eq(teamUserMapTable.userId, userTable.id)
        )
        .where(
            eq(teamUserMapTable.teamId, teamId)
        )
}

export const createTeamTransactional_Service = async (
    ownerUserId: string,
    type: 'RESTAURANT' | 'WEBSITE',
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
) => {
    // add team to db
    const team = await tx.insert(teamTable).values({
        ownerUserId: ownerUserId,
        type: type
    }).returning();

    // make user a member of the new team
    await tx.insert(teamUserMapTable).values({
        teamId: team[0].id,
        userId: ownerUserId,
        permissions: [TEAM_PERMISSIONS.FULL_ACCESS]
    });

    return team[0].id;
}

export const getSupportTeamByHostname_Service = async (hostname: string) => {
    const result = await db
        .select({
            teamId: teamTable.id,
            websiteId: websitesTable.id,
            name: websitesTable.name,
            defaultHostname: websitesTable.defaultHostname,
            ownerUserId: teamTable.ownerUserId
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

export const hasTeamPermission_Service = async (
    userId: string,
    teamId: string,
    permissions: string[]
) => {
    const team = await db.select({
        ownerUserId: teamTable.ownerUserId
    })
        .from(teamTable)
        .where(eq(teamTable.id, teamId))
        .then(results => results[0]);

    if (!team) {
        return false;
    }

    if (team.ownerUserId === userId) {
        return true;
    }

    const member = await db.select({
        permissions: teamUserMapTable.permissions
    })
        .from(teamUserMapTable)
        .where(
            and(
                eq(teamUserMapTable.teamId, teamId),
                eq(teamUserMapTable.userId, userId)
            )
        )
        .then(results => results[0]);

    if (member && Array.isArray(member.permissions)) {
        if (member.permissions.some(permission => permissions.includes(permission))) {
            return true;
        }
    }

    return false;
}

export const isAdminCheck = async (
    userId: string,
    ownerTeamId: string,
    supportTeamId: string | null,
    permissions: string[]
) => {
    if (
        supportTeamId &&
        await hasTeamPermission_Service(
            userId,
            supportTeamId,
            permissions
        )
    ) {
        return true;
    }
    if (
        await hasTeamPermission_Service(
            userId,
            ownerTeamId,
            permissions
        )
    ) {
        return true;
    }
    return false;
}

export const isInvitedBefore = async (
    email: string,
    teamId: string
) => {
    return await db.select({
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
}

export const insertInvitation = async (
    email: string,
    teamId: string,
    permissions: string[],
    requestingUserId: string,
    websiteName: string
) => {
    return await db.insert(teamInvitationsTable)
        .values({
            teamId,
            teamName: websiteName,
            inviterId: requestingUserId,
            email,
            permissions,
            status: "PENDING",
        })
        .returning()
        .then(results => results[0])
}

export const getTeamInvitation_Service = async (invitationId: string) => {
    return await db.select({
        id: teamInvitationsTable.id,
        teamId: teamInvitationsTable.teamId,
        teamName: teamInvitationsTable.teamName,
        email: teamInvitationsTable.email,
        status: teamInvitationsTable.status,
        permissions: teamInvitationsTable.permissions,
    })
        .from(teamInvitationsTable)
        .where(eq(teamInvitationsTable.id, invitationId))
        .then(results => results[0]);
}

export const getExistingTeamMembership = async (
    teamId: string,
    currentUserId: string
) => {
    return await db.select({
        teamId: teamUserMapTable.teamId,
    })
        .from(teamUserMapTable)
        .where(
            and(
                eq(teamUserMapTable.teamId, teamId),
                eq(teamUserMapTable.userId, currentUserId)
            )
        )
        .then(results => results[0])
}

export const addMemberToTeam = async (
    teamId: string,
    currentUserId: string,
    permissions: string[],
    invitationId: string
) => {
    return await db.transaction(async (tx) => {
        await tx.insert(teamUserMapTable)
            .values({
                teamId: teamId,
                userId: currentUserId,
                permissions: permissions
            });

        await tx.update(teamInvitationsTable)
            .set({
                status: "ACCEPTED",
                acceptedAt: Date.now()
            })
            .where(eq(teamInvitationsTable.id, invitationId));
    });
}

export const getTeamInvitations_Service = async (teamId: string) => {
    return await db.select({
        id: teamInvitationsTable.id,
        email: teamInvitationsTable.email,
        teamName: teamInvitationsTable.teamName,
        permissions: teamInvitationsTable.permissions,
        createdAt: teamInvitationsTable.created_at_ts,
        inviterName: userTable.name,
        inviterId: teamInvitationsTable.inviterId,
        status: teamInvitationsTable.status
    })
        .from(teamInvitationsTable)
        .leftJoin(
            userTable,
            eq(teamInvitationsTable.inviterId, userTable.id)
        )
        .where(
            eq(teamInvitationsTable.teamId, teamId),
            // and(
            //     eq(teamInvitationsTable.status, "PENDING")
            // )
        )
        .orderBy(teamInvitationsTable.created_at_ts);
}

export const cancelTeamInvitation_Service = async (invitationId: string, teamId: string) => {
    return await db.update(teamInvitationsTable)
        .set({
            status: "CANCELLED",
        })
        .where(
            and(
                eq(teamInvitationsTable.id, invitationId),
                eq(teamInvitationsTable.teamId, teamId),
                eq(teamInvitationsTable.status, "PENDING")
            )
        )
        .returning({ id: teamInvitationsTable.id })
        .then(results => results[0] || null);
}

export const transferTeamOwnership_Service = async (
    teamId: string,
    currentOwnerId: string,
    newOwnerId: string
) => {
    // Check if new owner is a member of the team
    const isMember = await db.select({ userId: teamUserMapTable.userId })
        .from(teamUserMapTable)
        .where(
            and(
                eq(teamUserMapTable.teamId, teamId),
                eq(teamUserMapTable.userId, newOwnerId)
            )
        )
        .then(results => results.length > 0);

    if (!isMember) {
        return null;
    }

    return await db.transaction(async (tx) => {
        // Update team owner
        await tx.update(teamTable)
            .set({ ownerUserId: newOwnerId })
            .where(
                and(
                    eq(teamTable.id, teamId),
                    eq(teamTable.ownerUserId, currentOwnerId)
                )
            );

        // Ensure new owner has FULL_ACCESS permission
        await tx.update(teamUserMapTable)
            .set({ permissions: [TEAM_PERMISSIONS.FULL_ACCESS] })
            .where(
                and(
                    eq(teamUserMapTable.teamId, teamId),
                    eq(teamUserMapTable.userId, newOwnerId)
                )
            );

        return { success: true };
    });
}

export const removeTeamMember_Service = async (
    teamId: string,
    userId: string,
    ownerUserId: string
) => {
    // Don't allow removing the owner
    if (userId === ownerUserId) {
        return null;
    }

    return await db.delete(teamUserMapTable)
        .where(
            and(
                eq(teamUserMapTable.teamId, teamId),
                eq(teamUserMapTable.userId, userId)
            )
        )
        .returning({ userId: teamUserMapTable.userId })
        .then(results => results[0] || null);
}

export const updateTeamMemberPermissions_Service = async (
    teamId: string,
    userId: string,
    ownerUserId: string,
    permissions: string[]
) => {
    // Don't allow changing the owner's permissions
    if (userId === ownerUserId) {
        return null;
    }

    return await db.update(teamUserMapTable)
        .set({ permissions })
        .where(
            and(
                eq(teamUserMapTable.teamId, teamId),
                eq(teamUserMapTable.userId, userId)
            )
        )
        .returning({
            userId: teamUserMapTable.userId,
            permissions: teamUserMapTable.permissions
        })
        .then(results => results[0] || null);
}