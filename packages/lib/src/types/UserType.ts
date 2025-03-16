export interface User {
    id: string;
    email: string;
    isEmailVerified: boolean;
    name: string;
    pictureUrl: string;
    has2FA: boolean;
    hasNewSession: boolean;
}

export type TwoFactorAuthVerifyPayload = {
    userId: string,
    email: string,
    nonce: string,
}