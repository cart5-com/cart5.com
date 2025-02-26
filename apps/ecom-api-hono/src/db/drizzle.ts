import { drizzle } from "drizzle-orm/libsql";
import { ecomApiSqlitelocalDbPath } from "lib/consts/ecom-api-consts";
import { IS_PROD } from "lib/utils/getEnvVariable";
import { createClient } from '@libsql/client';
import * as restaurantSchema from "./schema/restaurant/restaurant.schema";

export const schema = {
    ...restaurantSchema
};

export const getDrizzleDb = function (): ReturnType<typeof drizzle<typeof schema>> {
    const {
        ECOM_API_TURSO_DB_URL,
        ECOM_API_TURSO_DB_TOKEN,
        ECOM_API_TURSO_EMBEDDED_DB_PATH
    } = process.env;
    if (IS_PROD) {
        if (ECOM_API_TURSO_EMBEDDED_DB_PATH) {
            const client = createClient({
                url: `file:${ECOM_API_TURSO_EMBEDDED_DB_PATH}`,
                authToken: ECOM_API_TURSO_DB_TOKEN!,
                syncUrl: ECOM_API_TURSO_DB_URL!,
                syncInterval: 120,
            });
            client.sync();
            return drizzle(client, { schema });;
        } else {
            return drizzle({ connection: { url: ECOM_API_TURSO_DB_URL!, authToken: ECOM_API_TURSO_DB_TOKEN! }, schema })
        }
    } else {
        return drizzle(ecomApiSqlitelocalDbPath, { schema });
    }

};

const db = getDrizzleDb();
export default db;