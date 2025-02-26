import { defineConfig } from "drizzle-kit";

console.log("🔔drizzle.config.prod.ts");
console.log("🔔process.env.NODE_ENV:", process.env.NODE_ENV);

let config: ReturnType<typeof defineConfig>;
config = defineConfig({
	out: "./db/generated-sql",
	schema: "./db/schema/**/*.schema.ts",
	dialect: "turso",
	dbCredentials: {
		url: process.env.AUTHAPI_TURSO_DB_URL!,
		authToken: process.env.AUTHAPI_TURSO_DB_TOKEN!
	}
});
export default config;
