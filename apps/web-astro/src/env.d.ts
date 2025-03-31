/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
    interface Locals {
        WEBSITE: {
            id: string;
            name: string;
            isMarketplace: boolean;
        } | undefined;
    }
}

declare var SENTRY_RELEASE: { id: string };

declare var storeData: Awaited<ReturnType<typeof import("@db/services/store.service").getStoreData_Service>>;