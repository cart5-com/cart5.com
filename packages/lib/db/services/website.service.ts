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
                    defaultHostname: true,
                },
                with: {
                    domains: {
                        columns: {
                            hostname: true,
                        }
                    }
                },
            }
        },
    });

    return results.map(item => item.website);
}

/**
 * Create a new website
 */
export const createWebsiteService = async (userId: string, name: string, defaultHostname: string) => {
    return await db.transaction(async (tx) => {
        const website = await tx.insert(websitesTable).values({
            name: name,
            ownerUserId: userId,
            defaultHostname: defaultHostname
        }).returning({ id: websitesTable.id });

        // Add the user as an admin
        await tx.insert(websiteUserAdminsMapTable).values({
            websiteId: website[0].id,
            userId: userId,
        });

        // Add the default hostname to the domain map
        await tx.insert(websiteDomainMapTable).values({
            websiteId: website[0].id,
            hostname: defaultHostname,
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
