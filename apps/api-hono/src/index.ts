import { serve } from '@hono/node-server'
import { Hono } from "hono";
import { csrfChecks } from "./middlewares/csrf";
import { authChecks } from './middlewares/auth';
import { secureHeaders } from 'hono/secure-headers'
import { KNOWN_ERROR } from 'lib/types/errors';
import { userRoute } from 'lib/auth/user/router';
import { authGlobalRoute } from 'lib/auth-global/router';
import { otpRoute } from 'lib/auth/otp/router';
import { emailPasswordRoute } from 'lib/auth/emailPassword/router';
import { crossDomainRoute } from 'lib/auth/crossDomain/router';
import { googleOAuthRoute } from 'lib/auth/googleOAuth/router';
import { twoFactorAuthRoute } from 'lib/auth/twoFactorAuth/router';
import { mapsRoute } from 'lib/google-maps/mapsRoute';
import { restaurantRouter } from 'lib/dashboard/restaurant/router';
import { ENFORCE_HOSTNAME_CHECKS } from 'lib/auth/enforceHostnameChecks';
import { getOptionalEnvVariable, IS_PROD } from 'lib/utils/getEnvVariable';
import type { HonoVariables } from 'lib/hono/HonoVariables';
import { hostMustBeAuthDomain } from './middlewares/hostMustBeAuthDomain';
import { mustHaveUser } from './middlewares/mustHaveUser';
import db from 'lib/db/drizzle';
const app = new Hono<HonoVariables>();

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
	return c.html(`Hello ${IS_PROD ? "PROD" : "DEV"} ${ENFORCE_HOSTNAME_CHECKS ? "ENFORCE_HOSTNAME_CHECKS" : "NO_ENFORCE_HOSTNAME_CHECKS"}`);
});

app.get("/test-user", (c) => {
	const USER = c.get('USER');
	return c.html(`Hello ecom api ${IS_PROD ? "PROD" : "DEV"} ${USER ? JSON.stringify(USER) : "no user"}`);
});


const routes = app
	.basePath('/api_auth')
	.use(hostMustBeAuthDomain)
	.route('/user', userRoute)
	.route('/otp', otpRoute)
	.route('/email_password', emailPasswordRoute)
	.route('/cross_domain', crossDomainRoute)
	.route('/google_oauth', googleOAuthRoute)
	.route('/two_factor_auth', twoFactorAuthRoute)

export type AuthApiAppType = typeof routes;

const authGlobalRoutes = app
	.basePath('/api_auth_global')
	.route('/', authGlobalRoute)

export type AuthGlobalApiAppType = typeof authGlobalRoutes;

const ecomApiMapsRoutes = app.basePath('/api/maps')
	.route('/gmaps', mapsRoute);
export type EcomApiMapsAppType = typeof ecomApiMapsRoutes;

const dashboardRoutes = app
	.basePath('/api_dashboard')
	.use(mustHaveUser)
	.route('/restaurant', restaurantRouter);


export type EcomDashboardApiAppType = typeof dashboardRoutes;

const port = 3000;
let server: ReturnType<typeof serve>;

const startServer = () => {
	server = serve({
		fetch: app.fetch,
		port: port
	}, (info) => {
		if (IS_PROD) {
			console.log(`server info:${JSON.stringify(info)}`);
		}
		sendDiscordMessage(`PROD Server started on port ${port} (${IS_PROD ? 'PRODUCTION' : 'DEVELOPMENT'})`);
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
}

process.on('SIGTERM', () => {
	sendDiscordMessage(`SIGTERM signal received: closing HTTP server`);
	server.close(async function (err) {
		if (err) {
			sendDiscordMessage(`Error closing HTTP server: ${err}`);
		}
	});
});

// Graceful shutdown
process.on('SIGINT', () => {
	// not working on windows
	console.log('SIGINT signal received: closing HTTP server');
	sendDiscordMessage(`SIGINT signal received: closing HTTP server`);
	server.close(async function (err) {
		if (err) {
			sendDiscordMessage(`Error closing HTTP server: ${err}`);
			console.error(err)
			process.exit(1)
		}
		// console.log('HTTP server closed');
		// Perform any cleanup operations here (e.g., closing database connections)
		// TODO: create a simple cron job
		// stopCron();
		console.log('closing db client');
		await sendDiscordMessage(`closing db client`);
		await db.$client.close();
		console.log('db client closed');
		await sendDiscordMessage(`db client closed`);
		console.log('exiting; byeee!! 👋');
		await sendDiscordMessage(`exiting; byeee!! 👋`);
		process.exit(0);
	});
});

startServer();



// Add this function to send Discord messages
async function sendDiscordMessage(message: string) {
	const webhookUrl = getOptionalEnvVariable("DISCORD_WEBHOOK_URL");
	if (!webhookUrl) {
		if (IS_PROD) {
			console.log('Discord webhook URL not configured');
		}
		return;
	}

	try {
		await fetch(webhookUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				content: message,
			}),
		});
	} catch (error) {
		console.error('Failed to send Discord message:', error);
	}
}