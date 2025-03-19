import { eq, type InferInsertModel, or, inArray, and } from 'drizzle-orm';
import db from '@db/drizzle';
import { websitesTable, websiteDomainMapTable } from '@db/schema/website.schema';
import { TEAM_PERMISSIONS } from '@lib/consts';
import { createTeamTransactional_Service, createTeamWithoutOwner_Service, isAdminCheck } from './team.service';
import { teamUserMapTable } from '@db/schema/team.schema';

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

export const createWebsite_Service = async (ownerUserId: string, name: string, supportTeamId: string | null, isUserMemberOfSupportTeam: boolean) => {
    return await db.transaction(async (tx) => {
        const teamId = isUserMemberOfSupportTeam
            ? await createTeamWithoutOwner_Service('WEBSITE', tx)
            : await createTeamTransactional_Service(ownerUserId, 'WEBSITE', tx);
        const website = await tx.insert(websitesTable).values({
            name: name,
            ownerTeamId: teamId,
            supportTeamId: supportTeamId,
        }).returning({
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
