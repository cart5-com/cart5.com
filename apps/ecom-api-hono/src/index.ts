import { serve } from '@hono/node-server'
import { env } from 'hono/adapter'
import { Hono } from "hono";
import { secureHeaders } from 'hono/secure-headers'
import { KNOWN_ERROR } from 'lib/errors';
import { csrfChecks } from './middlewares/csrf';
import { authChecks } from './middlewares/auth';
import { restaurantRoute } from './dashboardRoutes/restaurantRoute';
import { IS_PROD } from 'lib/utils/getEnvVariable';


const app = new Hono<EcomApiHonoEnv>();

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
	const USER = c.get('USER');
	return c.html(`Hello ecom api ${IS_PROD ? "PROD" : "DEV"} ${USER ? JSON.stringify(USER) : "no user"}`);
});

const routes = app.basePath('/api');
export type EcomApiAppType = typeof routes;


const dashboardRoutes = app
	.use(async (c, next) => {
		// all dashboard routes are protected by auth
		const userId = c.get('USER')?.id;
		if (!userId) {
			throw new KNOWN_ERROR("UNAUTHORIZED", "UNAUTHORIZED");
		}
		await next();
	})
	.basePath('/api/dashboard')
	.route('/restaurant', restaurantRoute);


export type EcomDashboardApiAppType = typeof dashboardRoutes;

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