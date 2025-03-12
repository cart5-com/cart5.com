import { eq } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { websiteDomainMapTable, websitesTable } from '../../../../db/schema/website.schema';

export const listDomains_Service = async (
    websiteId: string,
    columns?: Partial<Record<keyof typeof websiteDomainMapTable.$inferSelect, boolean>>
) => {
    return await db.query.websitesTable.findFirst({
        where: eq(websitesTable.id, websiteId),
        with: {
            domains: {
                columns: columns
            }
        },
        columns: {
            id: true,
            defaultHostname: true
        }
    });
    // return await db.query.websiteDomainMapTable.findMany({
    //     where: eq(websiteDomainMapTable.websiteId, websiteId),
    //     columns: columns,
    // });
}