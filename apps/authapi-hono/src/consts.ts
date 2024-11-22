import { getEnvironmentVariable } from "lib/utils/getEnvironmentVariable";

export const SESSION_COOKIE_NAME = `session_${getEnvironmentVariable("PUBLIC_DOMAIN_NAME")}`;
export const GOOGLE_OAUTH_STATE_COOKIE_NAME = "google_state";
export const localDbPath = "file:./sqlite.db";