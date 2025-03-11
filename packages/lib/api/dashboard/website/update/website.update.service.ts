import { websitesTable } from '../../../../db/schema/website.schema';
import db from '../../../../db/drizzle';
import { eq } from 'drizzle-orm';

export const updateWebsite_Service = async (
    websiteId: string,
    data: Partial<typeof websitesTable.$inferInsert>
) => {
    const {
        // unallowed fields for admins
        id, created_at_ts, updated_at_ts, defaultHostname, ownerTeamId, supportTeamId,
        // other website tables
        // allowed fields for admins
        ...websiteData
    } = data;
    return await db.update(websitesTable)
        .set(websiteData)
        .where(eq(websitesTable.id, websiteId))
}