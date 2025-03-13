import db from "../../../db/drizzle";
import { websitesTable } from "../../../db/schema/website.schema";
import { type Context, type Next } from 'hono'
import { KNOWN_ERROR } from '../../../types/errors'
import { eq } from "drizzle-orm";
import { isAdminCheck } from "../team/_service_utils/isAdminCheck";
import { TEAM_PERMISSIONS } from "../../../db/schema/team.schema";

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
    return await isAdminCheck(
        userId, website.ownerTeamId, website.supportTeamId,
        [
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ]
    );
}



