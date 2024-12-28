import { createAuthApiClient } from "lib/src/apiClients/authApiClient";

export const authApiClient = createAuthApiClient(`/__p_auth/`);
export const createAuthApiClient_AsUrlHelper = function () {
    return createAuthApiClient(`${window.location.origin}/__p_auth/`);
};
