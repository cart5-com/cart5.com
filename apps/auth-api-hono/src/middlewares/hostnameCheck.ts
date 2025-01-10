import { createMiddleware } from "hono/factory";
import type { honoTypes } from "..";
import { env } from "hono/adapter";
import { KNOWN_ERROR } from "lib/errors";

export const hostnameCheck = createMiddleware<honoTypes>(async (c, next) => {
    if (
        c.req.path === '/api/cross_domain/callback' ||
        c.req.path === '/api/user/logout' ||
        c.req.path === '/api/user/whoami'
    ) {
        // these routes are not subject to origin checks
        await next();
    } else {
        const host = c.req.header()['host'];
        const ENFORCE_HOSTNAME_CHECKS = c.get('ENFORCE_HOSTNAME_CHECKS');
        if (ENFORCE_HOSTNAME_CHECKS && host !== `auth.${env(c).PUBLIC_DOMAIN_NAME}`) {
            console.log("hostnameCheck: host:", host);
            throw new KNOWN_ERROR(`Invalid host: ${host}`, "INVALID_HOST");
        }
        await next();
    }
});
