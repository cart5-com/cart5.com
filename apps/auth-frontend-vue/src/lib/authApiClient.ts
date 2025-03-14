import { createAuthApiClient, createAuthGlobalApiClient } from "lib/hono/apiClients/authApiClient";

export const getAuthApiClient = function () {
    return createAuthApiClient(`/__p_api/`);
};

export const getAuthGlobalApiClient = function () {
    return createAuthGlobalApiClient(`/__p_api/`);
};

export const createAuthApiClient_AsUrlHelper = function () {
    return createAuthApiClient(`${window.location.origin}/__p_api/`);
};
