import { drizzle } from "drizzle-orm/libsql";
import { localDbPath } from "lib/auth-consts";
import type { honoTypes } from "..";
import type { Context } from "hono";
import { env } from "hono/adapter";

let db: ReturnType<typeof drizzle>;
export const getDrizzleDb = function (c: Context<honoTypes>): ReturnType<typeof drizzle> {
    if (db) {
        return db;
    }
    const {
        AUTHAPI_TURSO_DB_URL,
        AUTHAPI_TURSO_DB_TOKEN,
        AUTHAPI_TURSO_EMBEDDED_DB_PATH
    } = env(c);
    const IS_PROD = c.get('IS_PROD')
    if (IS_PROD) {
        // if (AUTHAPI_TURSO_EMBEDDED_DB_PATH) {
        //     // has embedded db
        //     console.log("🔥🔥🔥has embedded db🔥🔥🔥");
        //     db = drizzle({
        //         connection: {
        //             url: `file:${AUTHAPI_TURSO_EMBEDDED_DB_PATH}`,
        //             authToken: AUTHAPI_TURSO_DB_TOKEN!,
        //             syncUrl: AUTHAPI_TURSO_DB_URL!,
        //             syncInterval: 120,
        //         }
        //     })
        //     return db;
        // } else {
        // no embedded db
        console.log("🔥🔥🔥no embedded db🔥🔥🔥");
        db = drizzle({
            connection: {
                url: AUTHAPI_TURSO_DB_URL!,
                authToken: AUTHAPI_TURSO_DB_TOKEN!,
            }
        })
        return db;
        // }
    } else {
        // DEV
        console.log("🔥🔥🔥DEV🔥🔥🔥");
        db = drizzle(localDbPath);
        return db;
    }

};

export default getDrizzleDb;
