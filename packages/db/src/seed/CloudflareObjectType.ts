// { "clientTcpRtt": 31, "requestHeaderNames": { }, "httpProtocol": "HTTP/2", "tlsCipher": "AEAD-AES128-GCM-SHA256", "continent": "NA", "asn": 577, "clientAcceptEncoding": "gzip, deflate, br, zstd", "country": "CA", "verifiedBotCategory": "", "tlsClientAuth": { "certIssuerDNLegacy": "", "certIssuerSKI": "", "certSubjectDNRFC2253": "", "certSubjectDNLegacy": "", "certFingerprintSHA256": "", "certNotBefore": "", "certSKI": "", "certSerial": "", "certIssuerDN": "", "certVerified": "NONE", "certNotAfter": "", "certSubjectDN": "", "certPresented": "0", "certRevoked": "0", "certIssuerSerial": "", "certIssuerDNRFC2253": "", "certFingerprintSHA1": "" }, "tlsClientExtensionsSha1": "VBPYllPMDM8uXa9XyKgG89RchcM=", "tlsExportedAuthenticator": { "clientFinished": "b344f56f2ec236c0790e82d2fc00566d75aa222074f03873da29d21d062bc126", "clientHandshake": "5f4f1c5df282613b988d5f8cd0421ebf7513a1a4fb70e3538afe36dedbe2b498", "serverHandshake": "3bfe074fa618b16fcde056a671f718d8006e0f89cb9b5b19227a8af91a91c9b2", "serverFinished": "e1d49fc0677968852768aa85a7f803796f16941fb2fc884e2763e6073e418616" }, "tlsVersion": "TLSv1.3", "city": "Toronto", "timezone": "America/Toronto", "requestPriority": "weight=256;exclusive=1", "region": "Ontario", "edgeRequestKeepAliveStatus": 1, "tlsClientRandom": "VNPAYykq7Ycoq15TjPHjelt+dq9B3qESH3mZpCNMFIY=", "longitude": "-79.48570", "latitude": "43.69340", "postalCode": "M6M", "regionCode": "ON", "asOrganization": "Bell Canada", "tlsClientHelloLength": "2058", "colo": "EWR", "botManagement": { "corporateProxy": false, "verifiedBot": false, "jsDetection": { "passed": false }, "staticResource": false, "detectionIds": { }, "score": 99 } }

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
