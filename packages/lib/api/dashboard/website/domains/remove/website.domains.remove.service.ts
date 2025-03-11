import { eq, and } from "drizzle-orm";
import db from "../../../../../db/drizzle";
import { KNOWN_ERROR } from "../../../../../types/errors";
import { websitesTable, websiteDomainMapTable } from "../../../../../db/schema/website.schema";


export const removeDomain_Service = async (websiteId: string, hostname: string) => {
    const website = await db.query.websitesTable.findFirst({
        where: eq(websitesTable.id, websiteId),
        columns: { defaultHostname: true }
    });
    if (!website) {
        throw new KNOWN_ERROR('Website not found', 'WEBSITE_NOT_FOUND');
    }
    await db.transaction(async (tx) => {
        if (website.defaultHostname === hostname) {
            await tx.update(websitesTable)
                .set({ defaultHostname: null })
                .where(eq(websitesTable.id, websiteId));
        }

        await tx.delete(websiteDomainMapTable)
            .where(
                and(
                    eq(websiteDomainMapTable.websiteId, websiteId),
                    eq(websiteDomainMapTable.hostname, hostname)
                )
            );
    });
    return true;
}
