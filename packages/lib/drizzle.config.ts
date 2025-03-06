import { defineConfig } from "drizzle-kit";

let config: ReturnType<typeof defineConfig>;
config = defineConfig({
	out: "./db/generated-sql",
	schema: "./db/schema/**/*.schema.ts",
	dialect: "sqlite",
	dbCredentials: { url: "file:../../apps/api-hono/local-sqlite.db" }
});
export default config;
