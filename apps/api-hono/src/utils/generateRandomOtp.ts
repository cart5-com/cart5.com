import { encodeBase32UpperCaseNoPadding } from "@oslojs/encoding";

export const generateNumberOnlyOtp = (size: number = 4) => {
    const characters = '0123456789';
    let code = '';
    for (let i = 0; i < size; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    return code;
}

export const generateOTPJsOnly = (size: number = 6) => {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // const characters = '0123456789QWERTYASDFGH';
    let code = '';
    for (let i = 0; i < size; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    return code.toUpperCase();
}

export function generateRandomOTP(): string {
    const bytes = new Uint8Array(5);
    crypto.getRandomValues(bytes);
    const code = encodeBase32UpperCaseNoPadding(bytes);
    return code;
}

export function generateRandomRecoveryCode(): string {
    const recoveryCodeBytes = new Uint8Array(10);
    crypto.getRandomValues(recoveryCodeBytes);
    const recoveryCode = encodeBase32UpperCaseNoPadding(recoveryCodeBytes);
    return recoveryCode;
}
