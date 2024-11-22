import { serve, type HttpBindings } from '@hono/node-server'
import { Hono } from "hono";
import { csrf } from "./middlewares/csrf";
import type { Session } from './lib/session.js';
import type { User } from './lib/user.js';
import { userRoute } from './api-routes/userRoute.js';
import { auth } from './middlewares/auth.js';
import { loginRoute } from './api-routes/loginRoute.js';

export type HonoVariables = {
	SESSION: Session | null,
	USER: User | null,
}

type Bindings = HttpBindings & {
	/* ... */
}

export type honoTypes = { Bindings: Bindings, Variables: HonoVariables };

const app = new Hono<honoTypes>();
app.use(csrf);
app.use(auth);

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
	` : `<a href="/__p/api/login/google-signin">Google Signin</a>
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
