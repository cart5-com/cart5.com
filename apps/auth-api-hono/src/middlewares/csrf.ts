import { createMiddleware } from "hono/factory";
import { verifyRequestOrigin } from "../utils/verifyRequestOrigin";
import type { honoTypes } from "..";
import { env } from "hono/adapter";

export const csrfChecks = createMiddleware<honoTypes>(async (c, next) => {
	if (c.req.method === "GET") {
		await next();
	} else {
		const internalAuthApiKey = c.req.header()['internal-auth-api-key'] ?? null;
		if (internalAuthApiKey === env(c).INTERNAL_AUTH_API_KEY) {
			await next();
		} else {
			const originHeader = c.req.header()['origin'] ?? null;
			const hostHeader = c.req.header()['host'] ?? null;
			if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
				console.log("csrfChecks:403:hono🔥🔥🔥c.req.header()🔥🔥🔥");
				console.log(c.req.header());
				return c.body("csrfChecks:403:hono", 403);
			}
			await next();
		}
	}
});
