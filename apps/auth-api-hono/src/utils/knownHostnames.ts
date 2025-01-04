
const KNOWN_HOSTNAMES = [
    "sample-store-1.com",
    "sample-store-2.com",
    // "unknown-store.com",
];

export function isKnownOriginRegex(host: string, KNOWN_DOMAINS_REGEX: string) {
    return new RegExp(KNOWN_DOMAINS_REGEX).test(host);
}

export const isKnownHostname = async (host: string, KNOWN_DOMAINS_REGEX: string, IS_PROD: boolean): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (IS_PROD) {
        return isKnownOriginRegex(host, KNOWN_DOMAINS_REGEX);
    }
    return isKnownOriginRegex(host, KNOWN_DOMAINS_REGEX) || KNOWN_HOSTNAMES.includes(host);
};