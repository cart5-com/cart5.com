import { defineConfig } from "drizzle-kit";
import { ecomApiSqlitelocalDbPath } from "lib/ecom-api-consts";

let config: ReturnType<typeof defineConfig>;
config = defineConfig({
	out: "./src/db/generated-sql",
	schema: "./src/db/schema/*",
	dialect: "sqlite",
	dbCredentials: { url: ecomApiSqlitelocalDbPath }
});
export default config;
