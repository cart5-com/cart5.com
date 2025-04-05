import { sentryMiddleware } from './middlewares/sentryMiddleware';
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
import { startCrons } from './cron';
import { apiAuthGlobal } from './routes/api_auth_global/_router';
import { apiAuth } from './routes/api_auth/_router';
import { apiDashboard } from './routes/api_dashboard/_router';
import { apiGMaps } from './routes/gmaps/mapsRoute.controller';
import { validateDomainForTLS } from './routes/validate_domain';

const app = new Hono<HonoVariables>();
if (IS_PROD) {
	app.use(sentryMiddleware);
}
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
app.route('/auth', apiAuth)
app.route('/auth_global', apiAuthGlobal)
app.route('/dashboard', apiDashboard)
app.route('/gmaps', apiGMaps)


const port = 3000;
export let server: ReturnType<typeof serve>;
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
startCrons();