/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
declare namespace App {
    interface Locals {
        USER: import("lib/apiClients/authApiClient").User | null;
    }
}
