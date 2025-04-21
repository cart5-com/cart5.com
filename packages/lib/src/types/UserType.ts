export interface User {
    id: string;
    email: string;
    isEmailVerified: boolean;
    name: string;
    pictureUrl: string;
    has2FA: boolean;
    hasNewSession: boolean;
    hasVerifiedPhoneNumber: 0 | 1;
}

export type TwoFactorAuthVerifyPayload = {
    userId: string,
    email: string,
    nonce: string,
}