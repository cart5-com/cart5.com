import { drizzle } from "drizzle-orm/libsql";
import { localDbPath } from "@lib/consts";
import { IS_PROD, getEnvVariable, getOptionalEnvVariable } from "@lib/utils/getEnvVariable";
import { existsSync, mkdirSync } from "fs";

import * as authSchema from './schema/auth.schema';
import * as storeSchema from './schema/store.schema';
import * as websiteSchema from './schema/website.schema';
import * as teamSchema from './schema/team.schema';
import * as userDataSchema from './schema/userData.schema';
import * as orderSchema from './schema/order.schema';
import * as autoprintSchema from './schema/autoprint.schema';
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
    // const {
    //     TURSO_DB_URL,
    //     TURSO_DB_TOKEN,
    //     // TURSO_EMBEDDED_DB_PATH
    // } = process.env;
    const TURSO_DB_URL = getEnvVariable("TURSO_DB_URL");
    const TURSO_DB_TOKEN = getEnvVariable("TURSO_DB_TOKEN");
    const TURSO_EMBEDDED_DB_PATH = getEnvVariable("TURSO_EMBEDDED_DB_PATH");
    if (IS_PROD) {
        // DISABLED BECAUSE UNABLE TO DETECT ERROR: 
        // libsql:: replication: replicator sync error: replication error: Injector error: SQLite error: database disk image is malformed
        // coolify does not support graceful shutdown. I believe it's because of this.
        if (TURSO_EMBEDDED_DB_PATH) {
            // Ensure the directory exists
            if (!existsSync(TURSO_EMBEDDED_DB_PATH)) {
                try {
                    mkdirSync(TURSO_EMBEDDED_DB_PATH, { recursive: true });
                    console.log(`Created directory: ${TURSO_EMBEDDED_DB_PATH}`);
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
                    syncInterval: 60,
                });
            } catch (err) {
                console.error("❌❌❌❌Error creating client");
                console.error(err);
            }

            setTimeout(async () => {
                try {
                    console.log("🟪🟪🟪🟪starting to sync db");
                    const res = await client?.sync()
                    console.log("🟪🟪🟪🟪 frame_no", res?.frame_no);
                    console.log("🟪🟪🟪🟪 frames_synced", res?.frames_synced);
                    console.log("🟪🟪🟪🟪 finished syncing db 🟪🟪🟪🟪");
                } catch (err) {
                    console.error("❌❌❌❌Error syncing db");
                    console.error(err);
                }
            }, 5e3);
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