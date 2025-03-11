import { eq } from "drizzle-orm";
import db from "../../../db/drizzle";
import { websitesTable } from "../../../db/schema/website.schema";
import { isUserHasTeamPermissionService } from "../../../db/services/team.service";
import { TEAM_PERMISSIONS } from "../../../db/schema/team.schema";
import { type Context, type Next } from 'hono'
import { KNOWN_ERROR } from '../../../types/errors'

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
        await isUserHasTeamPermissionService(
            userId,
            website.supportTeamId, [
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ])
    ) {
        return true;
    }
    if (
        await isUserHasTeamPermissionService(userId, website.ownerTeamId, [
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ])
    ) {
        return true;
    }
    return false;
}