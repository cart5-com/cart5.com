import { createAuthApiClient } from "lib/hono/apiClients/authApiClient";

export const getAuthApiClient = function () {
    return createAuthApiClient(`/__p_auth/`);
};
export const createAuthApiClient_AsUrlHelper = function () {
    return createAuthApiClient(`${window.location.origin}/__p_auth/`);
};
