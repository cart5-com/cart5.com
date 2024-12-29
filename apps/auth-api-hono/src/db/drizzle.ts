import { drizzle } from "drizzle-orm/libsql";
import { localDbPath } from "../consts";
import { checkMigrations } from "./migrate";
import { IS_PROD } from "../utils/getEnvironmentVariable";

const db: ReturnType<typeof drizzle> = IS_PROD ?
    // PROD
    drizzle({
        connection: {
            url: process.env.AUTHAPI_TURSO_DB_URL!,
            authToken: process.env.AUTHAPI_TURSO_DB_TOKEN!
        }
    })
    :
    // DEV
    drizzle(localDbPath);
export default db;

checkMigrations();