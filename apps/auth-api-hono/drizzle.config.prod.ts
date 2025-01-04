import { defineConfig } from "drizzle-kit";

let config: ReturnType<typeof defineConfig>;
config = defineConfig({
	out: "./src/db/generated-sql",
	schema: "./src/db/schema.ts",
	dialect: "turso",
	dbCredentials: {
		url: process.env.AUTHAPI_TURSO_DB_URL!,
		authToken: process.env.AUTHAPI_TURSO_DB_TOKEN!
	}
});
export default config;
