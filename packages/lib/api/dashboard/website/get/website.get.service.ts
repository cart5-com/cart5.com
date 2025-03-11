import { eq } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { websitesTable } from '../../../../db/schema/website.schema';

export const getWebsite_Service = async (
    websiteId: string,
    columns?: Partial<Record<keyof typeof websitesTable.$inferSelect, boolean>>
) => {
    return await db.query.websitesTable.findFirst({
        where: eq(websitesTable.id, websiteId),
        columns: columns,
    });
}