
export const SESSION_COOKIE_NAME = `auth_session`;
export const GOOGLE_OAUTH_COOKIE_NAME = `google_oauth_token`;
export const OTP_COOKIE_NAME = "otp_token";
export const OTP_COOKIE_NAME_AFTER_REGISTER = "otp_token_after_register";
export const TWO_FACTOR_AUTH_COOKIE_NAME = "two_factor_auth_token";
export const localDbPath = "file:../../local-sqlite.db";
export const SESSION_EXPIRES_IN = 2592000000; //1000 * 60 * 60 * 24 * 30; // 30 days
export const SESSION_ACTIVE_PERIOD_EXPIRATION_IN = 1296000000; //1000 * 60 * 60 * 24 * 15; // 15 days
export const CROSS_DOMAIN_SESSION_EXPIRES_IN = 600000; // 10 minutes

export const TEAM_PERMISSIONS = {
    FULL_ACCESS: "FULL_ACCESS",

    WEBSITE_MANAGER: "WEBSITE_MANAGER",

    TEAM_MANAGER: "TEAM_MANAGER",

    RESTAURANT_MANAGER: "RESTAURANT_MANAGER",
}

export const RESERVED_SUBDOMAINS = [
    'www',
    'auth',
    'api',
    'mail',
    'about',
    'blog',
    'shop',
    'store',
    'app',
    'dashboard',
    'dash',
    'admin',
    'login',
    'register',
    'com',
    'ecom',
    'ecommerce',
    'net',
    'org',
    'io',
    'ai',
    'dev',
    'test',
    'hello',
    'world',
    'example',
    'demo',
    'sandbox',
];

export const ecomApiCuisines = [
    "Burger",
    "Pizza",
    "Fast food",
    "Coffee",
    "Salads",
    "Sandwiches",
    "Asian",
    "Breakfast",
    "Pasta",
    "Sushi",
    "Mexican",
    "Italian",
    "Indian",
    "Chinese",
    "Kebab",
    "Seafood",
    "Thai",
    "American",
    "Vietnamese",
    "Japanese",
    "Turkish",
    "Fish & Chips",
    "Greek",
    "French",
    "Caribbean",
    "Lebanese",
    "North Indian",
    "Spanish",
]