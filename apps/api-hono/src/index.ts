import './utils/sentryNodeInit';
import { serve } from '@hono/node-server'
import { Hono } from "hono";
import { csrfChecks } from "./middlewares/csrf";
import { authChecks } from './middlewares/auth';
import { secureHeaders } from 'hono/secure-headers'
import type { HonoVariables } from './types/HonoVariables';
import { ENFORCE_HOSTNAME_CHECKS } from '@lib/utils/enforceHostnameChecks';
import { IS_PROD } from '@lib/utils/getEnvVariable';
import { sendDiscordMessage } from './utils/logging';
import { errorHandler } from './middlewares/errorHandler';
import { startCrons, stopCrons } from './cron/cron';
import { apiAuthGlobal } from './routes/api_auth_global/_router';
import { apiAuth } from './routes/api_auth/_router';
import { apiDashboard } from './routes/api_dashboard/_router';
import { apiGMaps } from './routes/gmaps/mapsRoute.controller';
import { validateDomainForTLS } from './routes/validate_domain';
import { apiUpload } from '@api-hono/routes/upload';
import { apiOrders } from './routes/api_orders/_router';
import { apiAutoprintPairing } from './routes/api_autoprint_pairing/_router';
import { paths } from './paths';
import { apiAutoprintTasks } from './routes/api_autoprint_tasks/_router';
import { stripeWebhook } from './routes/stripe/webhook';
import { closeDrizzleDb } from '@db/closeDrizzleDb';

const app = new Hono<HonoVariables>();
app.onError(errorHandler);

app.use(csrfChecks);
app.use(authChecks);
app.use(secureHeaders());

app.get("/", (c) => {
	return c.html(`Hello ${IS_PROD ? "PROD" : "DEV"} ${ENFORCE_HOSTNAME_CHECKS ? "✅ENFORCE_HOSTNAME_CHECKS" : "❌NO_ENFORCE_HOSTNAME_CHECKS"}`);
});
app.get(
	'/validate_tls',
	validateDomainForTLS
)
app.route(paths.upload, apiUpload)
app.route(paths.auth, apiAuth)
app.route(paths.auth_global, apiAuthGlobal)
app.route(paths.dashboard, apiDashboard)
app.route(paths.gmaps, apiGMaps)
app.route(paths.orders, apiOrders)
app.route(paths.autoprint_pairing, apiAutoprintPairing)
app.route(paths.autoprint_tasks, apiAutoprintTasks)
app.route(paths.stripe_webhook, stripeWebhook)

const port = 3000;
export let server: ReturnType<typeof serve>;
const startServer = () => {
	server = serve({
		fetch: app.fetch,
		port: port
	}, (info) => {
		sendDiscordMessage(`${JSON.stringify(info)}\nPROD Server started on port ${port} (${IS_PROD ? 'PRODUCTION' : 'DEVELOPMENT'})`);

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
startCrons();

// Graceful shutdown function
const gracefulShutdown = async (signal: string) => {
	console.log(`${signal} received, starting graceful shutdown...`);

	// Set a hard timeout to force exit if graceful shutdown takes too long
	const forceExitTimeout = setTimeout(() => {
		console.error('Graceful shutdown timed out after 15s, forcing exit');
		sendDiscordMessage('Graceful shutdown timed out, forcing exit').catch(console.error);
		process.exit(1);
	}, 15000);

	try {
		// Log shutdown to Discord if in production
		await sendDiscordMessage(`Server shutdown initiated by ${signal}`);

		// Stop all cron jobs
		console.log('Stopping cron jobs...');
		stopCrons();

		// Close the HTTP server with a timeout
		console.log('Closing HTTP server...');
		const serverClosed = new Promise<void>((resolve) => {
			server.close(() => {
				console.log('HTTP server closed');
				resolve();
			});

			// Force close after timeout
			setTimeout(() => {
				console.log('HTTP server close timeout reached, forcing shutdown');
				resolve();
			}, 5000);
		});

		await serverClosed;

		// Close database connections
		console.log('Closing database connections...');
		await closeDrizzleDb();

		console.log('Graceful shutdown completed');
		await sendDiscordMessage('Server shutdown completed successfully');
		clearTimeout(forceExitTimeout);
		process.exit(0);
	} catch (error) {
		console.error('Error during graceful shutdown:', error);
		await sendDiscordMessage(`Error during shutdown: ${error}`);
		clearTimeout(forceExitTimeout);
		process.exit(1);
	}
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
// process.on('uncaughtException', (error) => {
// 	console.error('Uncaught Exception:', error);
// 	sendDiscordMessage(`Uncaught Exception: ${error.message}\n${error.stack}`).catch(console.error);
// 	gracefulShutdown('uncaughtException');
// });

// process.on('unhandledRejection', (reason, promise) => {
// 	console.error('Unhandled Rejection at:', promise, 'reason:', reason);
// 	sendDiscordMessage(`Unhandled Rejection: ${reason}`).catch(console.error);
// 	gracefulShutdown('unhandledRejection');
// });

// For handling nodemon restarts and similar
process.on('message', (msg) => {
	if (msg === 'shutdown') {
		gracefulShutdown('Shutdown message');
	}
});