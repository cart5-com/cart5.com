import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { checkMigrations } from "./db/drizzle.js";
import { csrf } from "./middlewares/csrf";

const app = new Hono();
app.use(csrf);

app.get("/", (c) => {
	return c.text(`
    Hello Hono! SAMPLE_ENV_VAR:${process.env.SAMPLE_ENV_VAR}
	NODE_ENV: ${process.env.NODE_ENV}
`);
});

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({
	fetch: app.fetch,
	port
});

// TODO: Uncomment this when you want to check migrations
// checkMigrations();
