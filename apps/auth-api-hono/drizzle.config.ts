import { defineConfig } from "drizzle-kit";
import { localDbPath } from "lib/consts/auth-consts";

let config: ReturnType<typeof defineConfig>;
config = defineConfig({
	out: "./src/db/generated-sql",
	schema: "./src/db/schema/schema.ts",
	dialect: "sqlite",
	dbCredentials: { url: localDbPath }
});
export default config;
