import { createMiddleware } from "hono/factory";
import { KNOWN_ERROR } from "lib/errors";
import { ENFORCE_HOSTNAME_CHECKS } from "lib/auth/enforceHostnameChecks";
import { getEnvVariable } from "lib/utils/getEnvVariable";
import type { HonoVariables } from "lib/hono/HonoVariables";

export const hostnameCheck = createMiddleware<HonoVariables>(async (c, next) => {
    if (
        c.req.path === '/api/cross_domain/callback' ||
        c.req.path === '/api/user/logout' ||
        // c.req.path === '/api/user/logout-all' ||
        c.req.path === '/api/user/whoami'
    ) {
        // these routes are not subject to origin checks
        await next();
    } else {
        const host = c.req.header()['host'];
        if (ENFORCE_HOSTNAME_CHECKS && host !== `auth.${getEnvVariable('PUBLIC_DOMAIN_NAME')}`) {
            console.log("hostnameCheck: host:", host);
            throw new KNOWN_ERROR(`hostnameCheck: Invalid host: ${host}, c.req.path: ${c.req.path}`, "INVALID_HOST");
        }
        await next();
    }
});
