import { drizzle } from "drizzle-orm/libsql";
import * as authSchema from './schema/auth.schema';
import * as storeSchema from './schema/store.schema';
import * as websiteSchema from './schema/website.schema';
import * as teamSchema from './schema/team.schema';
import * as userDataSchema from './schema/userData.schema';
import * as orderSchema from './schema/order.schema';
import * as autoprintSchema from './schema/autoprint.schema';
import { localDbPath } from "@lib/consts";
import {
    IS_PROD, getEnvVariable,
    getOptionalEnvVariable
} from "@lib/utils/getEnvVariable";
import { existsSync, mkdirSync } from "fs";
import { createClient } from '@libsql/client';
export const schema = {
    ...authSchema,
    ...storeSchema,
    ...websiteSchema,
    ...teamSchema,
    ...userDataSchema,
    ...orderSchema,
    ...autoprintSchema
};

export const getDrizzleDb = function (): ReturnType<typeof drizzle<typeof schema>> {
    const TURSO_DB_URL = getEnvVariable("TURSO_DB_URL");
    const TURSO_DB_TOKEN = getEnvVariable("TURSO_DB_TOKEN");
    if (IS_PROD) {
        const TURSO_EMBEDDED_DB_PATH = getEnvVariable("TURSO_EMBEDDED_DB_PATH");
        if (TURSO_EMBEDDED_DB_PATH) {
            // Ensure the directory exists
            if (!existsSync(TURSO_EMBEDDED_DB_PATH)) {
                try {
                    mkdirSync(TURSO_EMBEDDED_DB_PATH, { recursive: true });
                } catch (err) {
                    console.error(`❌ Failed to create directory: ${TURSO_EMBEDDED_DB_PATH}`);
                    console.error(err);
                }
            }
            const NODE_APP_INSTANCE = getOptionalEnvVariable("NODE_APP_INSTANCE") || "0";
            let client: ReturnType<typeof createClient> | undefined;
            try {
                client = createClient({
                    url: `file:${TURSO_EMBEDDED_DB_PATH}/INSTANCE_${NODE_APP_INSTANCE}.db`,
                    authToken: TURSO_DB_TOKEN!,
                    syncUrl: TURSO_DB_URL!,
                    // syncInterval: 60, it does not work, fucking turso and its shitty docs wasted my 3 hours
                });
            } catch (err) {
                console.error("❌ Error creating client");
                console.error(err);
            }
            let syncRunning = false;
            const syncHandler = async () => {
                if (syncRunning) {
                    return;
                }
                syncRunning = true;
                try {
                    await client?.sync()
                } catch (err) {
                    console.error("❌ Error syncing database");
                    console.error(err);
                } finally {
                    syncRunning = false;
                }
            }
            syncHandler();
            setInterval(syncHandler, 60e3);
            return drizzle(client!, { schema });
        } else {
            return drizzle({ connection: { url: TURSO_DB_URL!, authToken: TURSO_DB_TOKEN! }, schema });
        }
    } else {
        return drizzle(localDbPath, { schema });
    }
};
const db = getDrizzleDb();
export default db;