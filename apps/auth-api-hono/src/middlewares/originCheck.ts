import { createMiddleware } from "hono/factory";
import type { honoTypes } from "..";
import { env } from "hono/adapter";
import { KNOWN_ERROR } from "lib/errors";

export const originCheck = createMiddleware<honoTypes>(async (c, next) => {
    if (
        c.req.path === '/api/cross_domain/callback' ||
        c.req.path === '/api/user/logout' ||
        c.req.path === '/api/user/whoami'
    ) {
        // these routes are not subject to origin checks
        await next();
    } else {
        const origin = c.req.header()['origin'];
        const ENFORCE_HOSTNAME_CHECKS = c.get('ENFORCE_HOSTNAME_CHECKS');
        if (ENFORCE_HOSTNAME_CHECKS && origin !== `https://auth.${env(c).PUBLIC_DOMAIN_NAME}`) {
            console.log("originCheck: origin:", origin);
            throw new KNOWN_ERROR(`Invalid origin: ${origin}`, "INVALID_ORIGIN");
        }
        await next();
    }
});
