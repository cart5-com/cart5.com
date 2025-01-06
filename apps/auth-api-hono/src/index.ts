import { serve, type HttpBindings } from '@hono/node-server'
import { env } from 'hono/adapter'
import { Hono } from "hono";
import { csrfChecks } from "./middlewares/csrf";
import { authChecks } from './middlewares/auth';
import { secureHeaders } from 'hono/secure-headers'
import { KNOWN_ERROR } from 'lib/errors';
import type { Session } from './types/SessionType';
import type { User } from './types/UserType';
import { userRoute } from './routes/userRoute';
import { otpRoute } from './routes/otpRoute';
import { emailPasswordRoute } from './routes/emailPasswordRoute';
import { crossDomainRoute } from './routes/crossDomainRoute';
import { googleOAuthRoute } from './routes/googleOAuthRoute';
import { twoFactorAuthRoute } from './routes/twoFactorAuthRoute';

export type HonoVariables = {
	SESSION: Session | null,
	USER: User | null,
	IS_PROD: boolean,
	ENFORCE_HOSTNAME_CHECKS: boolean
}

type Bindings = HttpBindings & {
	NODE_ENV: string;
	npm_lifecycle_event: string;
	PUBLIC_DOMAIN_NAME: string;
	KNOWN_DOMAINS_REGEX: string;
	ENCRYPTION_KEY: string;
	JWT_PRIVATE_KEY: string;
	INTERNAL_AUTH_API_KEY: string;
	TURNSTILE_SECRET: string;
	GOOGLE_OAUTH_CLIENT_ID?: string;
	GOOGLE_OAUTH_CLIENT_SECRET?: string;
	GOOGLE_OAUTH_REDIRECT_URI?: string;
	AUTHAPI_TURSO_DB_URL?: string;
	AUTHAPI_TURSO_DB_TOKEN?: string;
	AUTHAPI_TURSO_EMBEDDED_DB_PATH?: string;
}
export type honoTypes = { Bindings: Bindings, Variables: HonoVariables };

const app = new Hono<honoTypes>();

// const IS_PROD = getRuntimeKey() === "node"
// console.log("isNode:", isNode, getRuntimeKey())

app.use(async (c, next) => {
	const { NODE_ENV, npm_lifecycle_event } = env(c)
	const IS_PROD = NODE_ENV === 'production'
	const IS_CADDY_DEV = npm_lifecycle_event === 'dev:caddy'
	c.set('IS_PROD', IS_PROD)
	// IF PROD OR CADDY DEV, ENFORCE HOSTNAME CHECKS
	c.set('ENFORCE_HOSTNAME_CHECKS', (IS_CADDY_DEV || IS_PROD))
	await next()
})
app.use(csrfChecks);
app.use(authChecks);
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
	const ENFORCE_HOSTNAME_CHECKS = c.get('ENFORCE_HOSTNAME_CHECKS');
	return c.html(`Hello ${IS_PROD ? "PROD" : "DEV"} ${ENFORCE_HOSTNAME_CHECKS ? "ENFORCE_HOSTNAME_CHECKS" : "NO_ENFORCE_HOSTNAME_CHECKS"}`);
});

const routes = app.basePath('/api')
	.route('/user', userRoute)
	.route('/otp', otpRoute)
	.route('/email_password', emailPasswordRoute)
	.route('/cross_domain', crossDomainRoute)
	.route('/google_oauth', googleOAuthRoute)
	.route('/two-factor-auth', twoFactorAuthRoute)

export type AuthAppType = typeof routes;

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
serve({
	fetch: app.fetch,
	port: port
}, (info) => {
	console.log(`Api hono server is running on 
		http://127.0.0.1:${info.port} 
		address:${info.address} 
		family:${info.family}`);
});