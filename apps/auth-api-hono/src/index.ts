import { serve, type HttpBindings } from '@hono/node-server'
import { Hono } from "hono";
import { csrfChecks } from "./middlewares/csrf";
import type { Session } from './lib/session.js';
import type { User } from './lib/user.js';
import { authChecks } from './middlewares/auth.js';
import { userRoute } from './routes/userRoute.js';
import { loginRoute } from './routes/loginRoute.js';

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

app.get("/", (c) => {
	return c.html(`
    Hello Hono!
	<br>
	NODE_ENV: ${process.env.NODE_ENV}
	<br>
	${c.get("USER") ? `<pre>${JSON.stringify(c.get("USER"), null, 2)}</pre>
		<br>
		<a href="/api/user/whoami">whoami</a>
		<br>
		<a href="/api/user/logout">Logout</a>
	` : `<a href="/__p_auth/api/login/google-signin">Google Signin</a>
`}
`);
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
