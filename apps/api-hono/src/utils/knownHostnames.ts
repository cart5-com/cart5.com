import { isHostnameRegisteredService } from "@db/services/website.service";

export function isKnownOriginRegex(host: string, KNOWN_DOMAINS_REGEX: string) {
    return new RegExp(KNOWN_DOMAINS_REGEX).test(host);
}

export const isKnownHostname = async (host: string, KNOWN_DOMAINS_REGEX: string): Promise<boolean> => {
    // Check if the hostname matches the regex pattern or is registered in the database
    return isKnownOriginRegex(host, KNOWN_DOMAINS_REGEX) || await isHostnameRegisteredService(host);
};