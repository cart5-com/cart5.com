import { createMiddleware } from "hono/factory";
import { validateSessionCookie } from "../db/validateSessionCookie";
import { readBearerToken } from "../utils/readBearerToken";
import { getEnvVariable } from "lib/utils/getEnvVariable";
import type { HonoVariables } from "../index";
/**
 * Middleware to authenticate a request using a bearer token.
 * ignores session freshness checks
 * if user is already set, it will not be overwritten
 * @param c - The Hono context.
 * @param next - The next middleware function.
 */
export const authBearerTokenChecks = createMiddleware<HonoVariables>(async (c, next) => {
    const authorizationHeader = c.req.header()['authorization'] ?? null;
    const localUser = c.get('USER');
    const token = readBearerToken(authorizationHeader);
    if (localUser === null && authorizationHeader && token) {
        let hostname = c.req.header()['host'];
        const internalAuthApiKey = c.req.header()['internal-auth-api-key'] ?? null;
        if (internalAuthApiKey === getEnvVariable('INTERNAL_AUTH_API_KEY')) {
            // allow internal requests to bypass hostname checks
            hostname = c.req.header()['internal-host'];
        }
        const { user, session } = await validateSessionCookie(token, hostname!, true);
        c.set("SESSION", session);
        c.set("USER", user);
        await next();
    } else {
        await next();
    }
});