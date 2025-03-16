import { createMiddleware } from "hono/factory";
import { verifyRequestOrigin } from "@lib/utils/verifyRequestOrigin";
import type { HonoVariables } from "../HonoVariables";

export const csrfChecks = createMiddleware<HonoVariables>(async (c, next) => {
	if (c.req.method === "GET") {
		await next();
	} else {
		const originHeader = c.req.header()['origin'] ?? null;
		const hostHeader = c.req.header()['host'] ?? null;
		if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
			return c.body("csrfChecks:403:api-hono", 403);
		}
		await next();
	}
});
