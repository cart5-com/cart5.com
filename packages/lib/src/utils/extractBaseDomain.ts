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

    // Common TLDs including multi-level ones
    const commonTLDs = [
        'com', 'org', 'net', 'edu', 'gov', 'co.uk', 'org.uk', 'ac.uk',
        'gov.uk', 'com.au', 'net.au', 'org.au', 'co.nz', 'co.jp', 'co.za'
    ];

    // Split the hostname by dots
    const parts = hostWithoutPort.split('.');

    if (parts.length <= 1) {
        return fallback || 'cart5.com';
    }

    // Check for multi-level TLDs first
    for (const tld of commonTLDs) {
        const tldParts = tld.split('.');
        if (tldParts.length > 1) {
            const potentialTld = parts.slice(-tldParts.length).join('.');
            if (potentialTld === tld) {
                // If we have a multi-level TLD, return the domain + TLD
                return parts.slice(-tldParts.length - 1).join('.');
            }
        }
    }

    // For standard TLDs, return the last two parts
    if (parts.length >= 2) {
        return parts.slice(-2).join('.');
    }

    return fallback || 'cart5.com';
};