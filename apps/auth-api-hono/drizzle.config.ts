import { defineConfig } from "drizzle-kit";
import { getEnvironmentVariable, IS_PROD } from "lib/utils/getEnvironmentVariable";
import { localDbPath } from "./src/consts";

let config: ReturnType<typeof defineConfig>;
if (IS_PROD) {
	const url = getEnvironmentVariable("TURSO_AUTH_DB_URL");
	const authToken = getEnvironmentVariable("TURSO_AUTH_DB_TOKEN");
	config = defineConfig({
		out: "./src/db/generated-sql",
		schema: "./src/db/schema.ts",
		dialect: "turso",
		dbCredentials: {
			url,
			authToken
		}
	});
} else {
	config = defineConfig({
		out: "./src/db/generated-sql",
		schema: "./src/db/schema.ts",
		dialect: "sqlite",
		dbCredentials: { url: localDbPath }
	});
}
export default config;
