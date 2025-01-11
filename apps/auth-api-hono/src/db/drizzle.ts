import { drizzle } from "drizzle-orm/libsql";
import { localDbPath } from "lib/auth-consts";
import type { Context } from "hono";
import { env } from "hono/adapter";
import { createClient } from '@libsql/client';
import * as authSchema from './schema';

export const schema = {
    ...authSchema
};

let db: ReturnType<typeof drizzle<typeof schema>>;
export const getDrizzleDb = function (c: Context<AuthApiHonoEnv>): ReturnType<typeof drizzle<typeof schema>> {
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
        if (AUTHAPI_TURSO_EMBEDDED_DB_PATH) {
            const client = createClient({
                url: `file:${AUTHAPI_TURSO_EMBEDDED_DB_PATH}`,
                authToken: AUTHAPI_TURSO_DB_TOKEN!,
                syncUrl: AUTHAPI_TURSO_DB_URL!,
                syncInterval: 120,
            });
            client.sync();
            db = drizzle(client, { schema });
            return db;
        } else {
            db = drizzle({ connection: { url: AUTHAPI_TURSO_DB_URL!, authToken: AUTHAPI_TURSO_DB_TOKEN! }, schema });
            return db;
        }
    } else {
        db = drizzle(localDbPath, { schema });
        return db;
    }

};

export default getDrizzleDb;
