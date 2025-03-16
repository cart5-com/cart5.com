import db from "@db/drizzle";
import { teamTable, teamUserMapTable } from "@db/schema/team.schema";
import { TEAM_PERMISSIONS } from "@lib/consts";
import { eq, and } from "drizzle-orm";
import { websiteDomainMapTable, websitesTable } from "@db/schema/website.schema";

export const createTeamTransactional_Service = async (
    userId: string,
    type: 'RESTAURANT' | 'WEBSITE',
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
) => {
    // add team to db
    const team = await tx.insert(teamTable).values({
        ownerUserId: userId,
        type: type
    }).returning();

    // make user a member of the new team
    await tx.insert(teamUserMapTable).values({
        teamId: team[0].id,
        userId: userId,
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
