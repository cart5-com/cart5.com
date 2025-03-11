import { eq, and } from "drizzle-orm";
import db from "../../../../../db/drizzle";
import { KNOWN_ERROR } from "../../../../../types/errors";
import { websitesTable, websiteDomainMapTable } from "../../../../../db/schema/website.schema";


export const setDefaultDomain_Service = async (websiteId: string, hostname: string) => {
    return await db.transaction(async (tx) => {
        // Check if the domain exists and belongs to the website
        const domain = await tx.query.websiteDomainMapTable.findFirst({
            where: and(
                eq(websiteDomainMapTable.websiteId, websiteId),
                eq(websiteDomainMapTable.hostname, hostname)
            ),
            columns: { hostname: true }
        });

        if (!domain) {
            throw new KNOWN_ERROR('Domain not found or does not belong to this website', 'DOMAIN_NOT_FOUND_OR_DOES_NOT_BELONG_TO_THIS_WEBSITE');
        }

        // Update the default hostname
        await tx.update(websitesTable)
            .set({ defaultHostname: hostname })
            .where(eq(websitesTable.id, websiteId));

        return true;
    });
}
