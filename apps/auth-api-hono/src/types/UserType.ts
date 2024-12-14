export interface User {
    id: string;
    email: string;
    isEmailVerified: boolean;
    name: string;
    pictureUrl: string;
}

export type TwoFactorAuthVerifyPayload = {
    userId: string,
    email: string,
    nonce: string,
}