/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
declare namespace App {
    interface Locals {
        /** @deprecated 
         * because global cache configured for whole ssr astro app, 
         * /src/middleware/cacheHeaders.ts 
         * all user data should be handled in client side with rest api calls
         * we can change this in the future if needed
         * */
        USER: import("lib/hono/apiClients/authApiClient").User | null;
    }
}
