import { createMiddleware } from "hono/factory";
import { verifyRequestOrigin } from "lib/utils/verifyRequestOrigin";
import type { honoTypes } from "..";

export const csrfChecks = createMiddleware<honoTypes>(async (c, next) => {
	if (c.req.method === "GET") {
		await next();
	} else {
		const originHeader = c.req.header()['origin'] ?? null;
		const hostHeader = c.req.header()['host'] ?? null;
		if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
			return c.body("csrfChecks:403", 403);
		}
		await next();
	}
});
