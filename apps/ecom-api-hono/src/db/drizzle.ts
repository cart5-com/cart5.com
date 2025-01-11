import { drizzle } from "drizzle-orm/libsql";
import { ecomApiSqlitelocalDbPath } from "lib/ecom-api-consts";
import type { Context } from "hono";
import { env } from "hono/adapter";
import { createClient } from '@libsql/client';
import * as restaurantSchema from "./schema/restaurantSchema";

export const schema = {
    ...restaurantSchema
};

let db: ReturnType<typeof drizzle<typeof schema>>;
export const getDrizzleDb = function (c: Context<EcomApiHonoEnv>): ReturnType<typeof drizzle<typeof schema>> {
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
            const client = createClient({
                url: `file:${ECOM_API_TURSO_EMBEDDED_DB_PATH}`,
                authToken: ECOM_API_TURSO_DB_TOKEN!,
                syncUrl: ECOM_API_TURSO_DB_URL!,
                syncInterval: 120,
            });
            client.sync();
            db = drizzle(client, { schema });
            return db;
        } else {
            db = drizzle({ connection: { url: ECOM_API_TURSO_DB_URL!, authToken: ECOM_API_TURSO_DB_TOKEN! }, schema })
            return db;
        }
    } else {
        db = drizzle(ecomApiSqlitelocalDbPath, { schema });
        return db;
    }

};

export default getDrizzleDb;
