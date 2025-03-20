
export type CloudflareObjectType = {
    clientTcpRtt: number;
    requestHeaderNames: Record<string, unknown>;
    httpProtocol: string;
    tlsCipher: string;
    continent: string;
    asn: number;
    clientAcceptEncoding: string;
    country: string;
    verifiedBotCategory: string;
    tlsClientAuth: {
        certIssuerDNLegacy: string;
        certIssuerSKI: string;
        certSubjectDNRFC2253: string;
        certSubjectDNLegacy: string;
        certFingerprintSHA256: string;
        certNotBefore: string;
        certSKI: string;
        certSerial: string;
        certIssuerDN: string;
        certVerified: string;
        certNotAfter: string;
        certSubjectDN: string;
        certPresented: string;
        certRevoked: string;
        certIssuerSerial: string;
        certIssuerDNRFC2253: string;
        certFingerprintSHA1: string;
    };
    tlsClientExtensionsSha1: string;
    tlsExportedAuthenticator: {
        clientFinished: string;
        clientHandshake: string;
        serverHandshake: string;
        serverFinished: string;
    };
    tlsVersion: string;
    city: string;
    timezone: string;
    requestPriority: string;
    region: string;
    edgeRequestKeepAliveStatus: number;
    tlsClientRandom: string;
    longitude: string;
    latitude: string;
    postalCode: string;
    regionCode: string;
    asOrganization: string;
    tlsClientHelloLength: string;
    colo: string;
    botManagement: {
        corporateProxy: boolean;
        verifiedBot: boolean;
        jsDetection: {
            passed: boolean;
        };
        staticResource: boolean;
        detectionIds: Record<string, unknown>;
        score: number;
    };
};
