import { createAuthApiClient, type User } from "../../../auth-api-hono/src/authApiClient";
export const authApiClient = createAuthApiClient(`/__p_auth/`);
export const createAuthApiClientFunction = createAuthApiClient;
export type { User };
