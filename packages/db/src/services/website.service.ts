import { eq, type InferInsertModel, or, inArray, and, sql, like, count, desc } from 'drizzle-orm';
import db from '@db/drizzle';
import { websitesTable, websiteDomainMapTable, websiteRestaurantMapTable } from '@db/schema/website.schema';
import { TEAM_PERMISSIONS } from '@lib/consts';
import { createTeamTransactional_Service, createTeamWithoutOwner_Service, isAdminCheck } from './team.service';
import { teamUserMapTable } from '@db/schema/team.schema';
import { restaurantTable, restaurantAddressTable } from '@db/schema/restaurant.schema';
import { getAllRestaurantsThatUserHasAccessTo } from './restaurant.service';

export const getWebsite_Service = async (
    websiteId: string,
    columns?: Partial<Record<keyof typeof websitesTable.$inferSelect, boolean>>
) => {
    return await db.query.websitesTable.findFirst({
        where: eq(websitesTable.id, websiteId),
        columns: columns,
    });
}

export const updateWebsite_Service = async (
    websiteId: string,
    websiteData: Partial<InferInsertModel<typeof websitesTable>>
) => {
    return await db.update(websitesTable)
        .set(websiteData)
        .where(eq(websitesTable.id, websiteId))
}

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

export const isHostnameRegisteredService = async (hostname: string): Promise<boolean> => {
    const existingDomain = await db.query.websiteDomainMapTable.findFirst({
        where: eq(websiteDomainMapTable.hostname, hostname),
        columns: { hostname: true }
    });

    return !!existingDomain;
};


export const isUserWebsiteAdmin = async (
    userId: string,
    websiteId: string,
    permissions: (typeof TEAM_PERMISSIONS)[keyof typeof TEAM_PERMISSIONS][]
) => {
    // First, get the restaurant's owner and support team IDs
    const restaurant = await db.select({
        ownerTeamId: websitesTable.ownerTeamId,
        supportTeamId: websitesTable.supportTeamId
    })
        .from(websitesTable)
        .where(eq(websitesTable.id, websiteId))
        .then(results => results[0]);

    if (!restaurant) {
        return false;
    }
    return await isAdminCheck(
        userId,
        restaurant.ownerTeamId,
        restaurant.supportTeamId,
        permissions
    );
}

export const getAllWebsitesThatUserHasAccessTo = async (userId: string) => {
    const userTeams = await db.select()
        .from(teamUserMapTable)
        .where(eq(teamUserMapTable.userId, userId));

    const websites = await db.select({
        id: websitesTable.id,
        name: websitesTable.name,
        defaultHostname: websitesTable.defaultHostname
    })
        .from(websitesTable)
        .where(
            or(
                inArray(websitesTable.supportTeamId, userTeams.map(team => team.teamId)),
                inArray(websitesTable.ownerTeamId, userTeams.map(team => team.teamId))
            )
        );

    return websites;
}

export const createWebsite_Service = async (
    ownerUserId: string,
    name: string,
    supportTeamId: string | null,
    isUserMemberOfSupportTeam: boolean,
    websiteId?: string
) => {
    return await db.transaction(async (tx) => {
        const teamId = isUserMemberOfSupportTeam
            ? await createTeamWithoutOwner_Service('WEBSITE', tx)
            : await createTeamTransactional_Service(ownerUserId, 'WEBSITE', tx);
        const values = {
            name: name,
            ownerTeamId: teamId,
            supportTeamId: supportTeamId,
        }
        if (websiteId) {
            (values as any).id = websiteId;
        }
        const website = await tx.insert(websitesTable).values(values).returning({
            id: websitesTable.id,
            ownerTeamId: websitesTable.ownerTeamId,
            name: websitesTable.name
        });
        return website[0];
    })
}


export const addDomainToWebsite_Service = async (
    websiteId: string,
    website: Partial<InferInsertModel<typeof websitesTable>>,
    hostname: string
) => {
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
    })
}

export const getWebsiteWithDomains = async (websiteId: string) => {
    return await db.query.websitesTable.findFirst({
        where: eq(websitesTable.id, websiteId),
        with: {
            domains: {
                columns: {
                    hostname: true
                }
            }
        },
        columns: {
            id: true,
            defaultHostname: true
        }
    });
}

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

export const deleteDomainFromWebsite_Service = async (
    websiteId: string,
    website: Partial<InferInsertModel<typeof websitesTable>>,
    hostname: string
) => {
    return await db.transaction(async (tx) => {
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
    })
}

export const setDefaultDomain_Service = async (websiteId: string, hostname: string) => {
    // Update the default hostname
    await db.update(websitesTable)
        .set({ defaultHostname: hostname })
        .where(eq(websitesTable.id, websiteId));

    return true;
}

export const listRestaurantsForWebsite_Service = async (
    websiteId: string,
    limit: number = 10,
    offset: number = 0,
    search?: string,
    userId?: string
) => {
    const query = search ? `%${search}%` : '%';

    // Get user's restaurants if userId is provided
    let userRestaurantIds: string[] = [];
    if (userId) {
        const userRestaurants = await getAllRestaurantsThatUserHasAccessTo(userId);
        userRestaurantIds = userRestaurants.map((restaurant: { id: string }) => restaurant.id);
    }

    // Get all restaurants that match the search criteria
    const allRestaurants = await db
        .select({
            id: restaurantTable.id,
            name: restaurantTable.name,
            address1: restaurantAddressTable.address1,
            isListed: sql<boolean>`CASE 
                WHEN ${websiteRestaurantMapTable.restaurantId} IS NOT NULL THEN 1 
                ELSE 0 
            END`,
            // priority for user's restaurants
            isUserRestaurant: sql<boolean>`CASE 
                WHEN ${restaurantTable.id} IN (${userRestaurantIds.length > 0 ? userRestaurantIds.join(',') : 'NULL'}) THEN 1
                ELSE 0
            END`,
        })
        .from(restaurantTable)
        .leftJoin(
            restaurantAddressTable,
            eq(restaurantTable.id, restaurantAddressTable.restaurantId)
        )
        .leftJoin(
            websiteRestaurantMapTable,
            and(
                eq(websiteRestaurantMapTable.restaurantId, restaurantTable.id),
                eq(websiteRestaurantMapTable.websiteId, websiteId)
            )
        )
        .where(
            or(
                like(restaurantTable.name, query),
                like(restaurantAddressTable.address1, query)
            )
        )
        .limit(limit)
        .offset(offset)
        .orderBy(
            // priority for user's restaurants
            desc(sql<number>`CASE 
                WHEN ${restaurantTable.id} IN (${userRestaurantIds.length > 0 ? userRestaurantIds.join(',') : 'NULL'}) THEN 1
                ELSE 0
            END`),
            restaurantTable.created_at_ts
        );

    // Count total restaurants for pagination
    const totalCount = await db
        .select({
            count: count()
        })
        .from(restaurantTable)
        .leftJoin(
            restaurantAddressTable,
            eq(restaurantTable.id, restaurantAddressTable.restaurantId)
        )
        .where(
            or(
                like(restaurantTable.name, query),
                like(restaurantAddressTable.address1, query)
            )
        );

    return {
        restaurants: allRestaurants,
        pagination: {
            total: totalCount[0]?.count || 0,
            limit,
            offset
        }
    };
}

export const addRestaurantToWebsite_Service = async (
    websiteId: string,
    restaurantId: string
) => {
    // Insert into map table (will fail if already exists due to primary key constraint)
    try {
        await db.insert(websiteRestaurantMapTable).values({
            websiteId,
            restaurantId
        });
        return true;
    } catch (error) {
        // Record likely already exists
        return false;
    }
}

export const removeRestaurantFromWebsite_Service = async (
    websiteId: string,
    restaurantId: string
) => {
    await db.delete(websiteRestaurantMapTable)
        .where(
            and(
                eq(websiteRestaurantMapTable.websiteId, websiteId),
                eq(websiteRestaurantMapTable.restaurantId, restaurantId)
            )
        );
    return true;
}

export const getWebsiteInfo_Service = async (hostname: string) => {
    // First find the website by hostname
    const website = await db
        .select({
            websiteId: websitesTable.id,
            name: websitesTable.name,
            isPartner: websitesTable.isPartner,
            defaultHostname: websitesTable.defaultHostname,
            ownerTeamId: websitesTable.ownerTeamId,
            supportTeamId: websitesTable.supportTeamId,
        })
        .from(websiteDomainMapTable)
        .innerJoin(
            websitesTable,
            eq(websiteDomainMapTable.websiteId, websitesTable.id)
        )
        .where(eq(websiteDomainMapTable.hostname, hostname))
        .then(results => results[0] || null);

    if (!website) {
        return null;
    }

    // If it is a partner, return owner team id
    if (website.isPartner) {
        return {
            ...website,
            partnerInfo: {
                name: website.name,
                defaultHostname: website.defaultHostname,
                partnerTeamId: website.ownerTeamId
            }
        };
    } else if (website.supportTeamId) {
        const partnerWebsite = await db
            .select({
                id: websitesTable.id,
                name: websitesTable.name,
                ownerTeamId: websitesTable.ownerTeamId,
                defaultHostname: websitesTable.defaultHostname
            })
            .from(websitesTable)
            .where(eq(websitesTable.ownerTeamId, website.supportTeamId))
            .then(results => results[0] || null);

        if (partnerWebsite) {
            return {
                ...website,
                partnerInfo: {
                    name: partnerWebsite.name,
                    defaultHostname: partnerWebsite.defaultHostname,
                    partnerTeamId: partnerWebsite.ownerTeamId
                }
            };
        }
    }
    return {
        ...website,
        partnerInfo: {
            name: website.name,
            defaultHostname: website.defaultHostname,
            partnerTeamId: website.ownerTeamId
        }
    };
}

export const getWebsiteByOwnerTeamId_Service = async (ownerTeamId: string) => {
    return await db.query.websitesTable.findFirst({
        where: eq(websitesTable.ownerTeamId, ownerTeamId),
        columns: {
            id: true,
            name: true,
            defaultHostname: true,
        }
    });
}