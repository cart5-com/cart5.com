import { serve, type HttpBindings } from '@hono/node-server'
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
import { getEnvironmentVariable, IS_PROD } from './utils/getEnvironmentVariable';
import { waitUntilDbClientClosed } from './db/drizzle';

export type HonoVariables = {
	SESSION: Session | null,
	USER: User | null,
}

type Bindings = HttpBindings & {
	/* ... */
}

export type honoTypes = { Bindings: Bindings, Variables: HonoVariables };

const app = new Hono<honoTypes>();
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
	return c.html(`Hello Hono!`);
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
console.log(`Server is running on http://localhost:${port}`);
console.log("process.env.NODE_APP_INSTANCE", process.env.NODE_APP_INSTANCE);

let server: ReturnType<typeof serve>;
const startServer = () => {
	server = serve({
		fetch: app.fetch,
		port: port
	}, (info) => {

		if (IS_PROD) {
			console.log(`server info:${JSON.stringify(info)} NODE_APP_INSTANCE: ${getEnvironmentVariable("NODE_APP_INSTANCE")}`);
		}

		// Signal to PM2 that the app is ready
		if (process.send) {
			process.send('ready');
			console.log('ready!!');
			setTimeout(function () {
				if (process.send) {
					process.send('ready');
				}
			}, 1000);
		}
	});
};
// Graceful shutdown
process.on('SIGINT', () => {
	// not working on windows
	console.log('SIGINT signal received: closing HTTP server');
	server.close(async function (err) {
		if (err) {
			console.error(err)
			process.exit(1)
		}
		// console.log('HTTP server closed');
		// Perform any cleanup operations here (e.g., closing database connections)
		// stopCron();
		await waitUntilDbClientClosed();
		process.exit(0);
	});
});

startServer();