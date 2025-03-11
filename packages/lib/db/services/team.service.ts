import { TEAM_PERMISSIONS, teamTable } from "../schema/team.schema";

import db from "../drizzle";
import { teamUserMapTable } from "../schema/team.schema";
import { and, eq, inArray, or } from "drizzle-orm";
import { websitesTable } from "../schema/website.schema";

export const isUserHasTeamPermissionService = async (
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
        member.permissions.forEach(permission => {
            if (permissions.includes(permission)) {
                return true;
            }
        });
    }

    return false;
}

export const getUserWebsitesService = async (userId: string) => {
    // user is a member of these teams
    const teams = await db.select()
        .from(teamUserMapTable)
        .where(eq(teamUserMapTable.userId, userId));

    // teams have access to these websites
    const websites = await db.select({
        id: websitesTable.id,
        name: websitesTable.name
    })
        .from(websitesTable)
        .where(
            or(
                inArray(websitesTable.supportTeamId, teams.map(team => team.teamId)),
                inArray(websitesTable.ownerTeamId, teams.map(team => team.teamId))
            )
        );

    return websites;
}

export const createTeamTransactionalService = async (
    userId: string,
    name: string,
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0]
) => {
    const team = await tx.insert(teamTable).values({
        name: `${name} Team`,
        ownerUserId: userId
    }).returning();

    await tx.insert(teamUserMapTable).values({
        teamId: team[0].id,
        userId: userId,
        permissions: [TEAM_PERMISSIONS.FULL_ACCESS]
    });

    return team[0].id;
}