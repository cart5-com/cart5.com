import { drizzle } from "drizzle-orm/libsql";
import { localDbPath } from "../consts";
import type { honoTypes } from "..";
import type { Context } from "hono";
import { env } from "hono/adapter";

export const getDrizzleDb = function (c: Context<honoTypes>): ReturnType<typeof drizzle> {
    const { IS_PROD, AUTHAPI_TURSO_DB_URL, AUTHAPI_TURSO_DB_TOKEN } = env(c);
    return IS_PROD ?
        // PROD
        drizzle({
            connection: {
                url: AUTHAPI_TURSO_DB_URL!,
                authToken: AUTHAPI_TURSO_DB_TOKEN!
            }
        })
        :
        // DEV
        drizzle(localDbPath);
};

export default getDrizzleDb;