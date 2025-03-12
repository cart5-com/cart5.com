import { websitesTable } from '../../../../db/schema/website.schema';
import db from '../../../../db/drizzle';
import { eq, type InferInsertModel } from 'drizzle-orm';

export const updateWebsite_Service = async (
    websiteId: string,
    websiteData: Partial<InferInsertModel<typeof websitesTable>>
) => {
    const {
        // unallowed fields for admins
        id, created_at_ts, updated_at_ts, defaultHostname, ownerTeamId, supportTeamId,
        // other website tables
        // allowed fields for admins
        ...data
    } = websiteData;
    return await db.update(websitesTable)
        .set(data)
        .where(eq(websitesTable.id, websiteId))
}