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

export const USER_DATA_SESSION_EXPIRATION_TIME = 60_000; // 1 minutes

export const SESSION_STORAGE_KEYS = {
    USER_DATA: "SESSION_USER_DATA",
};

export const LOCAL_STORAGE_KEYS = {
    REMEMBER_LAST_EMAIL: "remember-last-email",
    REMEMBER_LAST_NAME: "remember-last-name"
};
