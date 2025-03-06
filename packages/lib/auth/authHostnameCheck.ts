import { type Context, type Next } from 'hono';
import { KNOWN_ERROR } from '../errors';
import { ENFORCE_HOSTNAME_CHECKS } from '../auth/enforceHostnameChecks';
import { getEnvVariable } from '../utils/getEnvVariable';

export async function authHostnameCheck(c: Context, next: Next) {
    const host = c.req.header()['host'];
    if (ENFORCE_HOSTNAME_CHECKS && host !== `auth.${getEnvVariable('PUBLIC_DOMAIN_NAME')}`) {
        console.log("authHostnameCheck: host:", host);
        throw new KNOWN_ERROR(`authHostnameCheck: Invalid host: ${host}, c.req.path: ${c.req.path}`, "INVALID_HOST");
    }
    await next();
}