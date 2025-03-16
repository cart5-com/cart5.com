import { serve } from '@hono/node-server'
import { Hono } from "hono";
import { csrfChecks } from "./middlewares/csrf";
import { authChecks } from './middlewares/auth';
import { secureHeaders } from 'hono/secure-headers'
import { KNOWN_ERROR } from '@lib/types/errors';
import type { HonoVariables } from './HonoVariables';
import { ENFORCE_HOSTNAME_CHECKS } from '@lib/utils/enforceHostnameChecks';
import { getEnvVariable, IS_PROD } from '@lib/utils/getEnvVariable';
import { hostMustBeAuthDomain } from './middlewares/hostMustBeAuthDomain';
import { mustHaveUser } from './middlewares/mustHaveUser';
import db from '@db/drizzle';

// import { userRoute } from 'lib/auth/user/router';
// import { authGlobalRoute } from 'lib/auth-global/router';
// import { otpRoute } from 'lib/auth/otp/router';
// import { emailPasswordRoute } from 'lib/auth/emailPassword/router';
// import { crossDomainRoute } from 'lib/auth/crossDomain/router';
// import { googleOAuthRoute } from 'lib/auth/googleOAuth/router';
// import { twoFactorAuthRoute } from 'lib/auth/twoFactorAuth/router';
// import { mapsRoute } from 'lib/google-maps/mapsRoute';
// import { restaurantRouter } from 'lib/api/dashboard/restaurant/restaurant.router';
// import { websiteRouter } from 'lib/api/dashboard/website/website.router';
// import { teamRouter } from 'lib/api/dashboard/team/team.router';
// import type { HonoVariables } from 'lib/hono/HonoVariables';
// import { validateDomainForTLS } from 'lib/api/validate_domain';

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
		sendDiscordMessage(`Index.ts onError: ${err}`);
		// this is same with hono's own error handler. 
		// but i like JSON response, not text
		if ("getResponse" in err) {
			return err.getResponse();
		}
		return c.json({
			error: {
				message: "Internal Server Error"
			},
		}, 503);
	}
})

app.get("/", (c) => {
	return c.html(`Hello ${IS_PROD ? "PROD" : "DEV"} ${ENFORCE_HOSTNAME_CHECKS ? "✅ENFORCE_HOSTNAME_CHECKS" : "❌NO_ENFORCE_HOSTNAME_CHECKS"}`);
});


// app.get(
// 	'/validate_tls',
// 	validateDomainForTLS
// );




const authRoutes = app
	.basePath('/api_auth')
	.use(hostMustBeAuthDomain)
// 	.route('/user', userRoute)
// 	.route('/otp', otpRoute)
// 	.route('/email_password', emailPasswordRoute)
// 	.route('/cross_domain', crossDomainRoute)
// 	.route('/google_oauth', googleOAuthRoute)
// 	.route('/two_factor_auth', twoFactorAuthRoute)
// export type AuthApiAppType = typeof authRoutes;





// const authGlobalRoutes = app
// 	.basePath('/api_auth_global')
// 	.route('/', authGlobalRoute)
// export type AuthGlobalApiAppType = typeof authGlobalRoutes;





// const ecomApiMapsRoutes = app.basePath('/api/maps')
// 	.route('/gmaps', mapsRoute);
// export type EcomApiMapsAppType = typeof ecomApiMapsRoutes;




const dashboardRoutes = app
	.basePath('/api_dashboard')
	.use(mustHaveUser)
// 	.route('/restaurant', restaurantRouter)
// 	.route('/website', websiteRouter)
// 	.route('/team', teamRouter)
// export type EcomDashboardApiAppType = typeof dashboardRoutes;




const port = 3000;

// Add this function to send Discord messages
async function sendDiscordMessage(message: string) {
	console.log('[DISCORD]', message);
	if (IS_PROD) {
		const webhookUrl = getEnvVariable("DISCORD_WEBHOOK_URL");
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

}

let server: ReturnType<typeof serve>;

const shutdown = async () => {
	await sendDiscordMessage(`Shutting down server...`);

	if (server) {
		console.log('Closing server...'); // Add console.log for debugging
		await new Promise<void>((resolve, reject) => {
			server.close((err) => {
				if (err) {
					sendDiscordMessage(`Error closing server: ${err}`);
					reject(err);
					return;
				}
				console.log('Server closed successfully'); // Add console.log for debugging
				resolve();
			});
		});
	}

	try {
		await sendDiscordMessage(`db client closing...`);
		await db.$client.close();
		await sendDiscordMessage(`db client closed`);
	} catch (err) {
		await sendDiscordMessage(`Error closing DB: ${err}`);
	}

	await sendDiscordMessage(`exiting; byeee!! 👋`);
	process.exit(0);
}

// Add more signal handlers and ensure they're properly logged
const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

// coolify does not support graceful shutdown.
signals.forEach(signal => {
	process.on(signal, async () => {
		console.log(`${signal} received`); // Add console.log for debugging
		try {
			await sendDiscordMessage(`${signal} signal received`);
			await shutdown();
		} catch (err) {
			console.error(`Error during ${signal} shutdown:`, err); // Add console.error for debugging
			await sendDiscordMessage(`Error during ${signal} shutdown: ${err}`);
			process.exit(1);
		}
	});
});

// Catch uncaught exceptions and unhandled rejections
process.on('uncaughtException', async (err) => {
	await sendDiscordMessage(`Uncaught exception: ${err}`);
	await shutdown();
});

process.on('unhandledRejection', async (err) => {
	await sendDiscordMessage(`Unhandled rejection: ${err}`);
	await shutdown();
});


const startServer = () => {
	server = serve({
		fetch: app.fetch,
		port: port
	}, (info) => {
		if (IS_PROD) {
			sendDiscordMessage(`server info:${JSON.stringify(info)}`);
		}
		sendDiscordMessage(`PROD Server started on port ${port} (${IS_PROD ? 'PRODUCTION' : 'DEVELOPMENT'})`);

		if (process.send) {
			process.send('ready');
			sendDiscordMessage('ready!!');
			setTimeout(function () {
				if (process.send) {
					process.send('ready');
				}
			}, 1000);
		}
	});
}

startServer();