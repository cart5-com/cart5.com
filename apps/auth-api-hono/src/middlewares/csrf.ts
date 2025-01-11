import { createMiddleware } from "hono/factory";
import { verifyRequestOrigin } from "lib/utils/verifyRequestOrigin";
import { env } from "hono/adapter";

export const csrfChecks = createMiddleware<AuthApiHonoEnv>(async (c, next) => {
	if (c.req.method === "GET") {
		await next();
	} else {
		const internalAuthApiKey = c.req.header()['internal-auth-api-key'] ?? null;
		if (internalAuthApiKey === env(c).INTERNAL_AUTH_API_KEY) {
			// allow internal requests to bypass csrf checks
			await next();
		} else {
			const originHeader = c.req.header()['origin'] ?? null;
			const hostHeader = c.req.header()['host'] ?? null;
			if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
				return c.body("csrfChecks:403:auth-api-hono", 403);
			}
			await next();
		}
	}
});
