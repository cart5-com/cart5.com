import { serve, type HttpBindings } from '@hono/node-server'
import { env } from 'hono/adapter'
import { Hono } from "hono";
import { secureHeaders } from 'hono/secure-headers'
import { KNOWN_ERROR } from 'lib/errors';

export type HonoVariables = {
	IS_PROD: boolean,
}

type Bindings = HttpBindings & {
	NODE_ENV: string;
	PUBLIC_DOMAIN_NAME: string;
	INTERNAL_AUTH_API_ORIGIN: string;
	INTERNAL_AUTH_API_KEY: string;
	ECOM_API_TURSO_DB_URL?: string;
	ECOM_API_TURSO_DB_TOKEN?: string;
	ECOM_API_TURSO_EMBEDDED_DB_PATH?: string;
}
export type honoTypes = { Bindings: Bindings, Variables: HonoVariables };

const app = new Hono<honoTypes>();


app.use(async (c, next) => {
	const { NODE_ENV } = env(c)
	const IS_PROD = NODE_ENV === 'production'
	c.set('IS_PROD', IS_PROD)
	await next()
})
// app.use(csrfChecks);
// app.use(authChecks);
app.use(secureHeaders());

app.onError((err, c) => {
	if (err instanceof KNOWN_ERROR) {
		console.log("KNOWN_ERROR err:");
		console.log(err);
		c.error = undefined;
		return c.json({
			error: {
				message: err.message,
				code: err.code
			},
		}, 500);
	} else {
		// this is same with hono's own error handler. 
		// but i like JSON
		if ("getResponse" in err) {
			return err.getResponse();
		}
		console.error(err);
		return c.json({
			error: {
				message: "Internal Server Error"
			},
		}, 503);
	}
})

app.get("/", (c) => {
	const IS_PROD = c.get('IS_PROD');
	return c.html(`Hello ecom api ${IS_PROD ? "PROD" : "DEV"}`);
});

const routes = app.basePath('/api')

export type EcomApiAppType = typeof routes;

const port = 3003;
serve({
	fetch: app.fetch,
	port: port
}, (info) => {
	console.log(`Api hono server is running on 
		http://127.0.0.1:${info.port} 
		address:${info.address} 
		family:${info.family}`);
});