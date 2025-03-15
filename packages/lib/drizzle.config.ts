import { defineConfig } from "drizzle-kit";
import { localDbPath } from "./consts/auth-consts";

let config: ReturnType<typeof defineConfig>;
config = defineConfig({
	out: "./db/generated-sql",
	schema: "./db/schema/**/*.schema.ts",
	dialect: "sqlite",
	dbCredentials: { url: localDbPath }
});
export default config;
