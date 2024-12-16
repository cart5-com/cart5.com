export const ROUTES = {
    INDEX: "/",
    LOGIN: "/login",
    SIGNUP: "/signup",
    OTP: "/otp",
    USER: {
        SETTINGS: "/user/settings",
        ASK: "/user/ask",
    },
};

export const USER_DATA_SESSION_EXPIRATION_TIME = 300_000; // 5 minutes
export const USER_DATA_SESSION_KEY = "SESSION_USER_DATA";