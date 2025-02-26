import { defineConfig } from "drizzle-kit";
import { ecomApiSqlitelocalDbPath } from "lib/consts/ecom-api-consts";

let config: ReturnType<typeof defineConfig>;
config = defineConfig({
	out: "./src/db/generated-sql",
	schema: "./src/db/schema/**/*.schema.ts",
	dialect: "sqlite",
	dbCredentials: { url: ecomApiSqlitelocalDbPath }
});
export default config;
