import { defineConfig } from "drizzle-kit";
import { localDbPath } from "@lib/consts";

let config: ReturnType<typeof defineConfig>;
config = defineConfig({
	out: "./src/generated-sql",
	schema: "./src/**/*.schema.ts",
	dialect: "sqlite",
	dbCredentials: { url: localDbPath }
});
export default config;
