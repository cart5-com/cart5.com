/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
declare namespace App {
    interface Locals {
        /** @deprecated 
         * because global cache configured for whole ssr astro app, 
         * /src/middleware/cacheHeaders.ts 
         * */
        USER: import("lib/apiClients/authApiClient").User | null;
    }
}
