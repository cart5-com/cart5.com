import { serve, type HttpBindings } from '@hono/node-server'
import { env } from 'hono/adapter'
import { Hono } from "hono";
import { csrfChecks } from "./middlewares/csrf";
import { authChecks } from './middlewares/auth';
import { secureHeaders } from 'hono/secure-headers'
import { KNOWN_ERROR } from './errors';
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
	IS_PROD: boolean
}

type Bindings = HttpBindings & {
	NODE_ENV: string;
	PUBLIC_DOMAIN_NAME: string;
	ENCRYPTION_KEY: string;
	JWT_PRIVATE_KEY: string;
	TURNSTILE_SECRET: string;
	GOOGLE_OAUTH_CLIENT_ID?: string;
	GOOGLE_OAUTH_CLIENT_SECRET?: string;
	GOOGLE_OAUTH_REDIRECT_URI?: string;
	AUTHAPI_TURSO_DB_URL?: string;
	AUTHAPI_TURSO_DB_TOKEN?: string;
}

export type honoTypes = { Bindings: Bindings, Variables: HonoVariables };

const app = new Hono<honoTypes>();

// const IS_PROD = getRuntimeKey() === "node"
// console.log("isNode:", isNode, getRuntimeKey())

app.use(async (c, next) => {
	const { NODE_ENV } = env(c)
	c.set('IS_PROD', NODE_ENV === 'production')
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
	return c.html(`Hello Hono! ${IS_PROD ? "PROD" : "DEV"}`);
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
		http://localhost:${info.port} 
		address:${info.address} 
		family:${info.family}`);
});