import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { resolve, dirname } from "node:path";
import { getEnvironmentVariable, IS_PROD } from "lib/utils/getEnvironmentVariable";

const dbUrl = getEnvironmentVariable("TURSO_AUTH_DB_URL");
const dbToken = getEnvironmentVariable("TURSO_AUTH_DB_TOKEN");

const db = drizzle({
    connection: {
        url: dbUrl,
        authToken: dbToken
    }
});


export const checkMigrations = async () => {
    console.log("Checking migrations...");
    const __dirname = dirname(new URL(import.meta.url).pathname);
    const path = IS_PROD ? "../src/db/sql-gen" : "./sql-gen";
    console.log("Migrations path:", path);
    await migrate(db, { migrationsFolder: resolve(__dirname, path) });
    console.log("Migrations checked");
};

export default db;
