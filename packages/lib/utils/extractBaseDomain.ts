import psl from 'psl';

/**
 * Extract the base domain from a hostname
 * 
 * sub.domain.com -> domain.com
 * www.domain.co.uk -> domain.co.uk
 * 
 * @param hostname - The hostname to extract the base domain from
 * @param fallback - The fallback domain to use if the hostname is not valid
 * @returns The base domain
 */
export const extractBaseDomain = (hostname: string, fallback?: string): string => {
    if (!hostname) {
        return fallback || 'cart5.com';
    }

    // Remove any port information if present
    const hostWithoutPort = hostname.split(':')[0];

    // Parse the domain using PSL
    const parsed = psl.parse(hostWithoutPort);

    // Return the domain (sld + tld) if valid, otherwise fallback to cart5.com
    return parsed && 'domain' in parsed && parsed.domain ? parsed.domain : fallback || 'cart5.com';
};