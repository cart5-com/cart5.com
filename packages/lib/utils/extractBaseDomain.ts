/**
 * Extracts the base domain from a hostname
 * Handles various scenarios like:
 * - www.partner.com -> partner.com
 * - sub.partner.com -> partner.com
 * - partner.com -> partner.com
 * - sub.domain.co.uk -> domain.co.uk
 */
export const extractBaseDomain = (hostname: string): string => {
    // Remove any port information if present
    const hostWithoutPort = hostname.split(':')[0];

    // Split the hostname by dots
    const parts = hostWithoutPort.split('.');

    // If we have 2 or fewer parts, return the hostname as is
    if (parts.length <= 2) {
        return hostWithoutPort;
    }

    // Check for common multi-part TLDs
    const multiPartTlds = ['co.uk', 'com.au', 'co.nz', 'co.jp', 'org.uk', 'net.au'];
    const lastTwoParts = parts.slice(-2).join('.');
    const lastThreeParts = parts.slice(-3).join('.');

    for (const tld of multiPartTlds) {
        if (lastThreeParts.endsWith(tld)) {
            // If it's a multi-part TLD, return the domain + multi-part TLD
            return parts.slice(-3).join('.');
        }
    }

    // For standard domains, return the last two parts (TLD + one level)
    return lastTwoParts;
}; 