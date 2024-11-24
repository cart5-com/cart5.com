import { serve, type HttpBindings } from '@hono/node-server'
import { Hono } from "hono";
import { csrfChecks } from "./middlewares/csrf";
import type { Session } from './lib/session.js';
import type { User } from './lib/user.js';
import { authChecks } from './middlewares/auth.js';
import { userRoute } from './routes/userRoute.js';
import { secureHeaders } from 'hono/secure-headers'
import { loginRoute } from './routes/loginRoute.js';
import { KNOWN_ERROR } from 'lib/errors';

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
		// ignore senty capture
		c.error = undefined;
		return c.json({
			error: {
				message: err.message,
				code: err.code
			},
			// data: null
		}, 500);
	} else {
		// this is same with hono's own error handler. 
		// but i like JSON response
		if ("getResponse" in err) {
			return err.getResponse();
		}
		console.error(err);
		return c.json({
			error: {
				message: "Internal Server Error"
			},
			// data: null
		}, 503);
	}
})

app.get("/", (c) => {
	return c.html(`Hello Hono!`);
});

const routes = app.basePath('/api')
	.route('/user', userRoute)
	.route('/login', loginRoute)

export type AuthAppType = typeof routes;

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
console.log(`Server is running on http://localhost:${port}`);



serve({
	fetch: app.fetch,
	port
});
