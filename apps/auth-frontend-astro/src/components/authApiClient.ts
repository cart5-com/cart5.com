import { createAuthApiClient } from "../../../auth-api-hono/src/authApiClient";
export const authApiClient = createAuthApiClient(`${window.location.origin}/__p_auth/`);