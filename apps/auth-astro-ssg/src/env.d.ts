/// <reference path="../.astro/types.d.ts" />

interface Window {
    user: import("lib/apiClients/authApiClient").User;
}
