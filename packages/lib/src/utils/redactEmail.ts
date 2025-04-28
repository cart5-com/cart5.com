export const redactEmail = (email: string) => {
    const [localPart, domain] = email.split('@');

    if (localPart && localPart.length <= 2) {
        // If local part is 1 or 2 chars, just return a single asterisk
        return `*@${domain}`;
    } else {
        // Keep first and last chars, replace middle with asterisks
        if (localPart) {
            const firstChar = localPart.charAt(0);
            const lastChar = localPart.charAt(localPart.length - 1);
            const middleLength = localPart.length - 2;
            const redactedLocalPart = firstChar + '*'.repeat(middleLength) + lastChar;
            return `${redactedLocalPart}@${domain}`;
        } else {
            return `*@${domain}`;
        }
    }
};
