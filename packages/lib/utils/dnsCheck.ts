import { getEnvVariable, IS_PROD } from "./getEnvVariable";
// DNS server options
export enum DnsServer {
    CLOUDFLARE = 'cloudflare', // Cloudflare DNS over HTTPS
    GOOGLE = 'google', // Google DNS over HTTPS (fallback)
}

// DNS over HTTPS endpoints
const DOH_ENDPOINTS = {
    [DnsServer.CLOUDFLARE]: 'https://cloudflare-dns.com/dns-query',
    [DnsServer.GOOGLE]: 'https://dns.google/resolve',
};

// Configuration for expected DNS values
const DNS_CONFIG = {
    // IPv4 address of the server
    ipv4: IS_PROD ? getEnvVariable('DNS_CHECK_IPV4') : '',
    // IPv6 address of the server
    ipv6: IS_PROD ? getEnvVariable('DNS_CHECK_IPV6') : '',
    // DNS pointer domain
    dnsPointer: IS_PROD ? getEnvVariable('DNS_CHECK_POINTER') : ''
};

/**
 * Query DNS records using DNS over HTTPS (DoH)
 * @param hostname The hostname to query
 * @param recordType The DNS record type (A, AAAA, CNAME)
 * @param dnsServer The DNS server to use
 * @param timeoutMs Timeout in milliseconds
 * @returns The DNS records
 */
async function queryDoh(
    hostname: string,
    recordType: 'A' | 'AAAA' | 'CNAME',
    dnsServer: DnsServer = DnsServer.CLOUDFLARE,
    timeoutMs: number = 5000
): Promise<string[]> {
    const endpoint = DOH_ENDPOINTS[dnsServer];
    const url = new URL(endpoint);

    // Add query parameters
    if (dnsServer === DnsServer.CLOUDFLARE) {
        // Cloudflare DNS API
        url.searchParams.append('name', hostname);
        url.searchParams.append('type', recordType);
    } else {
        // Google DNS API
        url.searchParams.append('name', hostname);
        url.searchParams.append('type', recordType);
    }

    try {
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/dns-json',
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Extract records based on the response format
        let records: string[] = [];

        if (data.Answer && Array.isArray(data.Answer)) {
            records = data.Answer
                .filter((answer: any) => {
                    // Filter by record type
                    if (recordType === 'A') return answer.type === 1;
                    if (recordType === 'AAAA') return answer.type === 28;
                    if (recordType === 'CNAME') return answer.type === 5;
                    return false;
                })
                .map((answer: any) => answer.data);
        }

        return records;
    } catch (error) {
        // If the primary DNS server fails, try the fallback
        if (dnsServer === DnsServer.CLOUDFLARE) {
            console.log(`Cloudflare DNS query failed, trying Google DNS fallback: ${(error as Error).message}`);
            return queryDoh(hostname, recordType, DnsServer.GOOGLE, timeoutMs);
        }
        throw error;
    }
}

/**
 * Check if a hostname is correctly pointed to dns-pointer.cart5.com or the correct IP addresses
 * @param hostname The hostname to check
 * @param options Optional configuration options
 * @returns A promise that resolves to the check result
 */
export async function checkDns(
    hostname: string,
    options: {
        timeoutMs?: number;
        dnsServer?: DnsServer;
    } = {}
): Promise<boolean> {
    const {
        timeoutMs = 5000,
        dnsServer = DnsServer.CLOUDFLARE
    } = options;


    try {
        // Check IPv4 first
        const ipv4Records = await queryDoh(hostname, 'A', dnsServer, timeoutMs);
        if (ipv4Records.length > 0 && ipv4Records.includes(DNS_CONFIG.ipv4)) {
            return true;
        }

        // If IPv4 fails, check IPv6
        const ipv6Records = await queryDoh(hostname, 'AAAA', dnsServer, timeoutMs);
        if (ipv6Records.length > 0 && ipv6Records.includes(DNS_CONFIG.ipv6)) {
            return true;
        }

        // If both IP checks fail, check CNAME
        const cnameRecords = await queryDoh(hostname, 'CNAME', dnsServer, timeoutMs);
        if (cnameRecords.length > 0 && cnameRecords.includes(DNS_CONFIG.dnsPointer)) {
            return true;
        }

        return false;
    } catch (error) {
        return false;
    }
}
