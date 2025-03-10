import { and, count, eq } from "drizzle-orm";

import {
    websitesTable,
    websiteDomainMapTable,
    websiteUserAdminsMapTable
} from '../schema/website.schema';
import db from '../drizzle';
import { KNOWN_ERROR } from "../../types/errors";
import type { NonEmptyArray } from "../../types/typeUtils";

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
            id, ownerUserId, created_at_ts, updated_at_ts, defaultHostname,
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
    type websiteType = NonNullable<typeof website>;

    type domains = websiteType['domains']
    type nonEmptyDomains = NonEmptyArray<domains>

    type newWebsiteType = (
        Omit<
            websiteType,
            'domains'
        > & {
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
        columns: { id: true, defaultHostname: true }
    });

    if (!website) {
        throw new KNOWN_ERROR('Website not found', 'WEBSITE_NOT_FOUND');
    }

    // Check if the domain already exists
    const isRegistered = await isHostnameRegisteredService(hostname);
    if (isRegistered) {
        throw new KNOWN_ERROR('Domain already exists', 'DOMAIN_ALREADY_EXISTS');
    }

    return await db.transaction(async (tx) => {
        // Add the domain
        await tx.insert(websiteDomainMapTable).values({
            websiteId,
            hostname
        });

        // If no default hostname exists, set this one as default
        if (!website.defaultHostname) {
            await tx.update(websitesTable)
                .set({ defaultHostname: hostname })
                .where(eq(websitesTable.id, websiteId));
        }

        return true;
    });
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
        throw new KNOWN_ERROR('Website not found', 'WEBSITE_NOT_FOUND');
    }

    if (website.defaultHostname === hostname) {
        await db.update(websitesTable)
            .set({ defaultHostname: null })
            .where(eq(websitesTable.id, websiteId));
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
            throw new KNOWN_ERROR('Domain not found or does not belong to this website', 'DOMAIN_NOT_FOUND_OR_DOES_NOT_BELONG_TO_THIS_WEBSITE');
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
