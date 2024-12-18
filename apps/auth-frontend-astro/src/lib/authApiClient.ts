import { createAuthApiClient, type User } from "../../../auth-api-hono/src/authApiClient";
export const authApiClient = createAuthApiClient(`/__p_auth/`);
export const createAuthApiClient_AsUrlHelper = function () {
    return createAuthApiClient(`${window.location.origin}/__p_auth/`);
};
export type { User };
