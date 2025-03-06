import { drizzle } from "drizzle-orm/libsql";
import { localDbPath } from "../consts/auth-consts";
import { IS_PROD } from "../utils/getEnvVariable";
import { createClient } from '@libsql/client';
import * as authSchema from './schema/auth.schema';
import * as restaurantSchema from './schema/restaurant.schema';

export const schema = {
    ...authSchema,
    ...restaurantSchema
};

export const getDrizzleDb = function (): ReturnType<typeof drizzle<typeof schema>> {
    // TODO: update env names to remove AUTH etc..
    const {
        AUTHAPI_TURSO_DB_URL,
        AUTHAPI_TURSO_DB_TOKEN,
        AUTHAPI_TURSO_EMBEDDED_DB_PATH
    } = process.env;
    if (IS_PROD) {
        if (AUTHAPI_TURSO_EMBEDDED_DB_PATH) {
            const client = createClient({
                url: `file:${AUTHAPI_TURSO_EMBEDDED_DB_PATH}`,
                authToken: AUTHAPI_TURSO_DB_TOKEN!,
                syncUrl: AUTHAPI_TURSO_DB_URL!,
                syncInterval: 120,
            });
            client.sync();
            return drizzle(client, { schema });
        } else {
            return drizzle({ connection: { url: AUTHAPI_TURSO_DB_URL!, authToken: AUTHAPI_TURSO_DB_TOKEN! }, schema });
        }
    } else {
        return drizzle(localDbPath, { schema });
    }

};

const db = getDrizzleDb();
export default db;