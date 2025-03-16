import { serve } from '@hono/node-server'
import { Hono } from "hono";
import { csrfChecks } from "./middlewares/csrf";
import { authChecks } from './middlewares/auth';
import { secureHeaders } from 'hono/secure-headers'
import type { HonoVariables } from './types/HonoVariables';
import { ENFORCE_HOSTNAME_CHECKS } from '@lib/utils/enforceHostnameChecks';
import { IS_PROD } from '@lib/utils/getEnvVariable';
import { hostMustBeAuthDomain } from './middlewares/hostMustBeAuthDomain';
import { mustHaveUser } from './middlewares/mustHaveUser';
import { validateDomainForTLS } from './routes/validate_domain';
import { apiAuth } from './routes/api_auth/_router';
import { sendDiscordMessage } from './utils/logging';
import { errorHandler } from './middlewares/errorHandler';

// import { mapsRoute } from 'lib/google-maps/mapsRoute';
// import { restaurantRouter } from 'lib/api/dashboard/restaurant/restaurant.router';
// import { websiteRouter } from 'lib/api/dashboard/website/website.router';
// import { teamRouter } from 'lib/api/dashboard/team/team.router';
// import type { HonoVariables } from 'lib/hono/HonoVariables';
// import { validateDomainForTLS } from 'lib/api/validate_domain';

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
);




const authRoutes = app
	.basePath('/api_auth')
	.use(hostMustBeAuthDomain)
	.route('/', apiAuth)

export type AuthApiAppType = typeof authRoutes;





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
let server: ReturnType<typeof serve>;
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