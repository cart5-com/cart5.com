import { and, eq } from "drizzle-orm";

import {
    websitesTable,
    websiteDomainMapTable,
} from '../schema/website.schema';
import db from '../drizzle';
import { KNOWN_ERROR } from "../../types/errors";
import type { NonEmptyArray } from "../../types/typeUtils";
import { getEnvVariable, IS_PROD } from "../../utils/getEnvVariable";
import { checkDns } from "../../utils/dnsCheck";
import { TEAM_PERMISSIONS } from "../schema/team.schema";
import {
    createTeamTransactionalService,
    isUserHasTeamPermissionService,
} from "./team.service";

export const isUserWebsiteAdminService = async function (
    userId: string, websiteId: string
) {
    // First, get the website's owner and support team IDs
    const website = await db.select({
        ownerTeamId: websitesTable.ownerTeamId,
        supportTeamId: websitesTable.supportTeamId
    })
        .from(websitesTable)
        .where(eq(websitesTable.id, websiteId))
        .then(results => results[0]);

    if (!website) {
        return false;
    }
    if (
        website.supportTeamId &&
        await isUserHasTeamPermissionService(
            userId,
            website.supportTeamId, [
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ])
    ) {
        return true;
    }
    if (
        await isUserHasTeamPermissionService(userId, website.ownerTeamId, [
            TEAM_PERMISSIONS.FULL_ACCESS,
            TEAM_PERMISSIONS.WEBSITE_MANAGER
        ])
    ) {
        return true;
    }
    return false;
}


/**
 * Create a new website
 */
export const createWebsiteService = async (userId: string, name: string) => {
    return await db.transaction(async (tx) => {
        const teamId = await createTeamTransactionalService(userId, `${name} Team`, tx);
        // TODO: add support team
        const website = await tx.insert(websitesTable).values({
            name: name,
            ownerTeamId: teamId,
        }).returning({ id: websitesTable.id });

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
            id, created_at_ts, updated_at_ts, defaultHostname, ownerTeamId, supportTeamId,
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

const reservedSubdomains = [
    'www',
    'api',
    'mail',
    'about',
    'blog',
    'shop',
    'store',
    'app',
    'dashboard',
    'dash',
    'admin',
    'auth',
    'login',
    'register',
    'com',
    'net',
    'org',
    'io',
    'ai',
    'dev',
    'test',
    'hello',
    'world',
    'example',
    'demo',
    'sandbox',
];
/**
 * Add a domain to a website
 */
export const addDomainService = async (websiteId: string, hostname: string) => {
    const PUBLIC_DOMAIN_NAME = getEnvVariable('PUBLIC_DOMAIN_NAME');
    if (IS_PROD) {
        // Check if trying to add a reserved subdomain
        if (hostname.endsWith(`.${PUBLIC_DOMAIN_NAME}`)) {
            const subdomain = hostname.split(`.${PUBLIC_DOMAIN_NAME}`)[0].toLowerCase();
            if (reservedSubdomains.includes(subdomain)) {
                throw new KNOWN_ERROR('This subdomain is reserved', 'RESERVED_SUBDOMAIN');
            }
        }
    }
    // Check if the website exists
    const website = await db.query.websitesTable.findFirst({
        where: eq(websitesTable.id, websiteId),
        with: {
            domains: {
                columns: {
                    hostname: true
                }
            }
        },
        columns: { id: true, defaultHostname: true }
    });

    if (!website) {
        throw new KNOWN_ERROR('Website not found', 'WEBSITE_NOT_FOUND');
    }

    // Check if trying to add a subdomain when one already exists
    const isRequestedHostnameSubdomain = hostname.endsWith(`.${PUBLIC_DOMAIN_NAME}`);
    if (isRequestedHostnameSubdomain) {
        const existingSubdomain = website.domains?.find(d =>
            d.hostname.endsWith(`.${PUBLIC_DOMAIN_NAME}`)
        );
        if (existingSubdomain) {
            throw new KNOWN_ERROR('Website already has a subdomain', 'SUBDOMAIN_ALREADY_EXISTS');
        }
    }

    if (IS_PROD) {
        // Skip DNS check if hostname is a subdomain of PUBLIC_DOMAIN_NAME
        if (!hostname.endsWith(`.${PUBLIC_DOMAIN_NAME}`) && !await checkDns(hostname)) {
            throw new KNOWN_ERROR("Invalid DNS", "INVALID_DNS");
        }
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
