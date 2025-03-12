import db from "../../../db/drizzle";
import { websitesTable } from "../../../db/schema/website.schema";
import { TEAM_PERMISSIONS, teamTable, teamUserMapTable } from "../../../db/schema/team.schema";
import { type Context, type Next } from 'hono'
import { KNOWN_ERROR } from '../../../types/errors'
import { and, eq } from "drizzle-orm";



export async function websiteAdminCheck(c: Context, next: Next) {
    const userId = c.get('USER')?.id;
    const websiteId = c.req.param('websiteId');
    if (!userId || !websiteId) {
        throw new KNOWN_ERROR("Unauthorized", "UNAUTHORIZED");
    }
    const isAdmin = await isUserWebsiteAdmin(userId, websiteId);
    if (!isAdmin) {
        throw new KNOWN_ERROR("Not admin", "UNAUTHORIZED");
    }
    await next();
}

export const isUserWebsiteAdmin = async function (
    userId: string, websiteId: string
) {
    // First, get the website's owner and support team IDs
    const website = await db.select({
        ownerTeamId: websitesTable.ownerTeamId,
        supportTeamId: websitesTable.supportTeamId
    })
        .from(websitesTable)
        .where(eq(websitesTable.id, websiteId))
        .then(results => results[0]);

    if (!website) {
        return false;
    }
    if (
        website.supportTeamId &&
        await isUserHasTeamPermission_Service(
            userId,
            website.supportTeamId, [
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ])
    ) {
        return true;
    }
    if (
        await isUserHasTeamPermission_Service(userId, website.ownerTeamId, [
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ])
    ) {
        return true;
    }
    return false;
}

export const isUserHasTeamPermission_Service = async (
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
