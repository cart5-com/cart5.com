/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
    interface Locals {
        WEBSITE: Awaited<ReturnType<typeof import("@db/services/website.service").getWebsiteByDefaultHostname>>;
    }
}

declare var SENTRY_RELEASE: { id: string };

declare var storeData: Awaited<ReturnType<typeof import("@db/services/store.service").getStoreData_Service>>;
declare var supportTeamServiceFee: Awaited<ReturnType<typeof import("@db/services/website.service").getSupportTeamServiceFee_Service>>;
declare var websiteTeamServiceFee: Awaited<ReturnType<typeof import("@db/services/website.service").getWebsiteTeamServiceFee_Service>>;
declare var orderType: import("@lib/types/orderType").OrderType;