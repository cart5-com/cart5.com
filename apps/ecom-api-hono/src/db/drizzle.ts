import { drizzle } from "drizzle-orm/libsql";
import { ecomApiSqlitelocalDbPath } from "lib/ecom-api-consts";
import type { honoTypes } from "..";
import type { Context } from "hono";
import { env } from "hono/adapter";
import { createClient } from '@libsql/client';


let db: ReturnType<typeof drizzle>;
export const getDrizzleDb = function (c: Context<honoTypes>): ReturnType<typeof drizzle> {
    if (db) {
        return db;
    }
    const {
        ECOM_API_TURSO_DB_URL,
        ECOM_API_TURSO_DB_TOKEN,
        ECOM_API_TURSO_EMBEDDED_DB_PATH
    } = env(c);
    const IS_PROD = c.get('IS_PROD')
    if (IS_PROD) {
        if (ECOM_API_TURSO_EMBEDDED_DB_PATH) {
            // has embedded db
            console.log("🔥🔥🔥has embedded db🔥🔥🔥");
            const client = createClient({
                url: `file:${ECOM_API_TURSO_EMBEDDED_DB_PATH}`,
                authToken: ECOM_API_TURSO_DB_TOKEN!,
                syncUrl: ECOM_API_TURSO_DB_URL!,
                syncInterval: 120,
            });
            client.sync();
            db = drizzle(client);
            return db;
        } else {
            // no embedded db
            console.log("🔥🔥🔥no embedded db🔥🔥🔥");
            db = drizzle({
                connection: {
                    url: ECOM_API_TURSO_DB_URL!,
                    authToken: ECOM_API_TURSO_DB_TOKEN!,
                }
            })
            return db;
        }
    } else {
        // DEV
        console.log("🔥🔥🔥DEV🔥🔥🔥");
        db = drizzle(ecomApiSqlitelocalDbPath);
        return db;
    }

};

export default getDrizzleDb;
