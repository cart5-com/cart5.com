import { and, count, eq } from "drizzle-orm";

import {
    websitesTable,
    websiteDomainMapTable,
    websiteUserAdminsMapTable
} from '../schema/website.schema';
import db from '../drizzle';

/**
 * Check if a user is an admin of a website
 */
export const isUserWebsiteAdminService = async function (
    userId: string, websiteId: string
) {
    return await db.select({
        count: count()
    }).from(websiteUserAdminsMapTable).where(
        and(
            eq(websiteUserAdminsMapTable.userId, userId),
            eq(websiteUserAdminsMapTable.websiteId, websiteId)
        )
    ).then(result => result[0].count === 1);
}

/**
 * Get all websites that a user is an admin of
 */
export const getMyWebsitesService = async (userId: string) => {
    const results = await db.query.websiteUserAdminsMapTable.findMany({
        where: eq(websiteUserAdminsMapTable.userId, userId),
        columns: {},
        with: {
            website: {
                columns: {
                    id: true,
                    name: true,
                },
                // with: {
                //     domains: {
                //         columns: {
                //             hostname: true,
                //         }
                //     }
                // },
            }
        },
    });

    return results.map(item => item.website);
}

/**
 * Create a new website
 */
export const createWebsiteService = async (userId: string, name: string) => {
    return await db.transaction(async (tx) => {
        const website = await tx.insert(websitesTable).values({
            name: name,
            ownerUserId: userId,
        }).returning({ id: websitesTable.id });

        // Add the user as an admin
        await tx.insert(websiteUserAdminsMapTable).values({
            websiteId: website[0].id,
            userId: userId,
        });

        return website[0].id;
    });
}

/**
 * Update a website
 */
export const updateWebsiteService = async (
    websiteId: string,
    data: Partial<typeof websitesTable.$inferInsert>
) => {
    return await db.transaction(async (tx) => {
        const {
            // unallowed fields for admins
            id, ownerUserId, created_at_ts, updated_at_ts,
            // other website tables
            // allowed fields for admins
            ...websiteData
        } = data;

        const updates = [];

        // Update website data
        if (Object.keys(websiteData).length > 0) {
            updates.push(tx.update(websitesTable)
                .set(websiteData)
                .where(eq(websitesTable.id, websiteId)));
        }
        await Promise.all(updates);

        return websiteId;
    });
}

export const getWebsiteService = async (
    websiteId: string,
    columns?: Partial<Record<keyof typeof websitesTable.$inferSelect, boolean>> & {
        domains?: Partial<Record<keyof typeof websiteDomainMapTable.$inferSelect, boolean>>
    }
) => {
    const website = await db.query.websitesTable.findFirst({
        where: eq(websitesTable.id, websiteId),
        columns: columns,
        with: {
            ...(columns?.domains && {
                domains: {
                    columns: columns.domains
                }
            })
        }
    });

    // this typing is to make sure typing work with hono rpc.
    // https://hono.dev/docs/guides/rpc
    // api never returns {} but drizzle adds a {} when there is no "with" query ...
    type NonEmpty<T> = T extends {} ? (T[keyof T] extends never ? never : T) : T;
    type websiteType = NonNullable<typeof website>;

    type domains = websiteType['domains']
    type nonEmptyDomains = NonEmpty<domains>

    type newWebsiteType = (
        Omit<websiteType, 'domains'> & {
            domains?: nonEmptyDomains
        }
    ) | undefined

    return website as newWebsiteType;
}

/**
 * Add a domain to a website
 */
export const addDomainService = async (websiteId: string, hostname: string) => {
    // Check if the website exists
    const website = await db.query.websitesTable.findFirst({
        where: eq(websitesTable.id, websiteId),
        columns: { id: true }
    });

    if (!website) {
        throw new Error('Website not found');
    }

    // Check if the domain already exists
    const existingDomain = await db.query.websiteDomainMapTable.findFirst({
        where: eq(websiteDomainMapTable.hostname, hostname),
        columns: { hostname: true }
    });

    if (existingDomain) {
        throw new Error('Domain already exists');
    }

    // Add the domain
    await db.insert(websiteDomainMapTable).values({
        websiteId,
        hostname
    });

    return true;
}

/**
 * Remove a domain from a website
 */
export const removeDomainService = async (websiteId: string, hostname: string) => {
    // Check if the domain is the default hostname
    const website = await db.query.websitesTable.findFirst({
        where: eq(websitesTable.id, websiteId),
        columns: { defaultHostname: true }
    });

    if (!website) {
        throw new Error('Website not found');
    }

    if (website.defaultHostname === hostname) {
        throw new Error('Cannot remove the default domain. Set another domain as default first.');
    }

    // Remove the domain
    await db.delete(websiteDomainMapTable)
        .where(
            and(
                eq(websiteDomainMapTable.websiteId, websiteId),
                eq(websiteDomainMapTable.hostname, hostname)
            )
        );

    return true;
}

/**
 * Set a domain as the default for a website
 */
export const setDefaultDomainService = async (websiteId: string, hostname: string) => {
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
            throw new Error('Domain not found or does not belong to this website');
        }

        // Update the default hostname
        await tx.update(websitesTable)
            .set({ defaultHostname: hostname })
            .where(eq(websitesTable.id, websiteId));

        return true;
    });
}

/**
 * Check if a hostname is registered in the system
 */
// Check if the provided hostname is already taken
// const existingDomain = await isHostnameRegisteredService(defaultHostname);
// if (existingDomain) {
//     throw new KNOWN_ERROR("Domain already taken", "DOMAIN_ALREADY_TAKEN");
// }
export const isHostnameRegisteredService = async (hostname: string): Promise<boolean> => {
    const existingDomain = await db.query.websiteDomainMapTable.findFirst({
        where: eq(websiteDomainMapTable.hostname, hostname),
        columns: { hostname: true }
    });

    return !!existingDomain;
};
