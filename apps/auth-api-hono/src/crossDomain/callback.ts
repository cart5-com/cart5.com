import { type Context } from 'hono'
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { validateTurnstile } from 'lib/utils/validateTurnstile';
import { KNOWN_ERROR } from 'lib/errors';
import { isKnownHostname } from '../utils/knownHostnames';
import { CROSS_DOMAIN_SESSION_EXPIRES_IN } from 'lib/auth-consts';
import { decryptAndVerifyJwt } from '../utils/jwt';
import { ENFORCE_HOSTNAME_CHECKS } from '../enforceHostnameChecks';
import { IS_PROD, getEnvVariable } from 'lib/utils/getEnvVariable';
import type { HonoVariables } from "../index";
import { createUserSessionAndSetCookie } from '../session/session.controller';
import type { ValidatorContext } from 'lib/types/hono/ValidatorContext';
import type { CrossDomainCodePayload } from './redirector';


// this is the callback url from the target domain, we use proxy to get the request here.
// Validate query parameters - require code and redirectUrl
export const callbackSchemaValidator = zValidator('query', z.object({
    code: z.string().min(1, { message: "code required" }),
    redirectUrl: z.string().min(1, { message: "redirectUrl required" }),
}))
export const callbackRoute = async (
    c: Context<
        HonoVariables,
        "/callback",
        ValidatorContext<typeof callbackSchemaValidator>
    >
) => {
    const query = c.req.valid('query');
    const redirectUrl = new URL(decodeURIComponent(query.redirectUrl));

    // Decrypt and verify the JWT token
    const {
        userId,
        turnstile,
        createdAtTimestamp,
        sourceHost,
        targetHost
    } = await decryptAndVerifyJwt<CrossDomainCodePayload>(
        getEnvVariable('JWT_PRIVATE_KEY'),
        getEnvVariable('ENCRYPTION_KEY'),
        query.code
    );


    if (ENFORCE_HOSTNAME_CHECKS && sourceHost !== (`auth.${getEnvVariable('PUBLIC_DOMAIN_NAME')}`)) {
        throw new KNOWN_ERROR("Invalid source host", "INVALID_SOURCE_HOST");
    }

    // Verify turnstile token is valid
    // this will make sure it is used only one time!
    await validateTurnstile(getEnvVariable('TURNSTILE_SECRET'), turnstile, c.req.header()['x-forwarded-for']);

    // Validate current domain is in allowed list
    const host = c.req.header()['host'];
    if (!host) {
        throw new KNOWN_ERROR("Host not found", "HOST_NOT_FOUND");
    }

    if (ENFORCE_HOSTNAME_CHECKS && !await isKnownHostname(host, getEnvVariable('KNOWN_DOMAINS_REGEX'), IS_PROD)) {
        throw new KNOWN_ERROR("Invalid redirect URL", "INVALID_REDIRECT_URL");
    }

    // Validate payload
    if (!userId) {
        throw new KNOWN_ERROR("User not found", "USER_NOT_FOUND");
    }
    if (Date.now() - createdAtTimestamp > CROSS_DOMAIN_SESSION_EXPIRES_IN) {
        throw new KNOWN_ERROR("Code expired", "CODE_EXPIRED");
    }

    if (ENFORCE_HOSTNAME_CHECKS && targetHost !== host) {
        throw new KNOWN_ERROR("Host mismatch", "HOST_MISMATCH");
    }

    // Create new permanent session for this domain
    await createUserSessionAndSetCookie(c, userId);

    // Redirect to final destination
    return c.redirect(redirectUrl.toString());
}