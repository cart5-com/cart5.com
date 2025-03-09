import psl from 'psl';

export const extractBaseDomain = (hostname: string): string => {
    if (!hostname) {
        return 'cart5.com';
    }

    // Remove any port information if present
    const hostWithoutPort = hostname.split(':')[0];

    // Parse the domain using PSL
    const parsed = psl.parse(hostWithoutPort);

    // Return the domain (sld + tld) if valid, otherwise fallback to cart5.com
    return parsed && 'domain' in parsed && parsed.domain ? parsed.domain : 'cart5.com';
};