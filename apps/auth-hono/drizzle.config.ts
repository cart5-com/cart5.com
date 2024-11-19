import { defineConfig } from "drizzle-kit";
import { getEnvironmentVariable } from "lib/utils/getEnvironmentVariable";

const dbUrl = getEnvironmentVariable("TURSO_AUTH_DB_URL");
const dbToken = getEnvironmentVariable("TURSO_AUTH_DB_TOKEN");

export default defineConfig({
	out: "./src/db/sql-gen",
	schema: "./src/db/schema.ts",
	dialect: "turso",
	dbCredentials: {
		url: dbUrl,
		authToken: dbToken
	}
});
