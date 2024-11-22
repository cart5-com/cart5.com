import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { resolve, dirname } from "node:path";
import { getEnvironmentVariable, IS_PROD } from "lib/utils/getEnvironmentVariable";
import { localDbPath } from "../consts";

let db: ReturnType<typeof drizzle>;
if (IS_PROD) {
    const dbUrl = getEnvironmentVariable("TURSO_AUTH_DB_URL");
    const dbToken = getEnvironmentVariable("TURSO_AUTH_DB_TOKEN");
    db = drizzle({
        connection: {
            url: dbUrl,
            authToken: dbToken
        }
    });
} else {
    db = drizzle(localDbPath)
}


export const checkMigrations = async () => {
    console.log("Checking migrations...");
    const __dirname = dirname(new URL(import.meta.url).pathname);
    const path = IS_PROD ? "../src/db/generated-sql" : "./generated-sql";
    console.log("Migrations path:", path);
    await migrate(db, { migrationsFolder: resolve(__dirname, path) });
    console.log("Migrations completed");
};

export default db;

if (getEnvironmentVariable("AUTO_MIGRATE_DB") === "1") {
    console.log("Auto migrate enabled...");
    checkMigrations();
}