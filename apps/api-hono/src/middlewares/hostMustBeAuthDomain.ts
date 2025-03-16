import { createMiddleware } from "hono/factory";
import { KNOWN_ERROR } from '@lib/types/errors';
import { ENFORCE_HOSTNAME_CHECKS } from '@lib/utils/enforceHostnameChecks';
import { getEnvVariable } from '@lib/utils/getEnvVariable';
import type { HonoVariables } from "../HonoVariables";

export const hostMustBeAuthDomain = createMiddleware<HonoVariables>(async (c, next) => {
    const host = c.req.header()['host'];
    if (ENFORCE_HOSTNAME_CHECKS && host !== `auth.${getEnvVariable('PUBLIC_DOMAIN_NAME')}`) {
        console.log("authHostnameCheck: host:", host);
        throw new KNOWN_ERROR(`authHostnameCheck: Invalid host: ${host}, c.req.path: ${c.req.path}`, "INVALID_HOST");
    }
    await next();
});