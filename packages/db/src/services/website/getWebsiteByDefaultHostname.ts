import { eq } from 'drizzle-orm';
import db from '@db/drizzle';
import { websitesTable, websiteDomainMapTable } from '@db/schema/website.schema';

export const getWebsiteByDefaultHostname = async (hostname: string) => {
    const result = await db
        .select()
        .from(websitesTable)
        .where(eq(websitesTable.defaultHostname, hostname));
    return result[0];
};

export const getRedirectHostname = async (hostname: string) => {
    const domainMapResult = await db
        .select({
            defaultHostname: websitesTable.defaultHostname
        })
        .from(websiteDomainMapTable)
        .where(eq(websiteDomainMapTable.hostname, hostname))
        .innerJoin(websitesTable, eq(websiteDomainMapTable.websiteId, websitesTable.id))
        .limit(1);

    return domainMapResult[0]?.defaultHostname || null;
};

