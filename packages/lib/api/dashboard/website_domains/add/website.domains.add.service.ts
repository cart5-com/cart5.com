import { eq } from 'drizzle-orm';
import db from '../../../../db/drizzle';
import { websiteDomainMapTable, websitesTable } from '../../../../db/schema/website.schema';
import { getEnvVariable, IS_PROD } from '../../../../utils/getEnvVariable';
import { KNOWN_ERROR } from '../../../../types/errors';
import { isHostnameRegisteredService } from '../../../validate_domain';
import { checkDns } from '../../../../utils/dnsCheck';


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
    'ecom',
    'ecommerce',
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

export const addDomain_Service = async (websiteId: string, hostname: string) => {
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
        columns: {
            id: true,
            defaultHostname: true
        }
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
