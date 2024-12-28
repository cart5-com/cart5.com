/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
declare namespace App {
    interface Locals {
        USER: import("lib/src/apiClients/authApiClient").User | null;
    }
}
