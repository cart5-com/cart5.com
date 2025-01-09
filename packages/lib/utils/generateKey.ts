import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";

export const generateKey = (prefix = 'na', size = 16) => {
    return `${prefix}_${generateIdFromEntropySize(size)}`;
}

export function generateIdFromEntropySize(size: number) {
    const buffer = crypto.getRandomValues(new Uint8Array(size));
    return encodeBase32LowerCaseNoPadding(buffer);
}
