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
    // getOptionalEnvVariable
} from "@lib/utils/getEnvVariable";
// import { existsSync, mkdirSync } from "fs";

// import { createClient } from '@libsql/client';

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
    if (IS_PROD) {
        console.log("🟦 Starting production database initialization");

        // const TURSO_EMBEDDED_DB_PATH = getEnvVariable("TURSO_EMBEDDED_DB_PATH");
        // if (TURSO_EMBEDDED_DB_PATH) {
        //     console.log("🟦 Using embedded database path:", TURSO_EMBEDDED_DB_PATH);
        //     // Ensure the directory exists
        //     if (!existsSync(TURSO_EMBEDDED_DB_PATH)) {
        //         console.log("🟦 Directory does not exist, attempting to create");
        //         try {
        //             mkdirSync(TURSO_EMBEDDED_DB_PATH, { recursive: true });
        //             console.log(`✅ Created directory: ${TURSO_EMBEDDED_DB_PATH}`);
        //         } catch (err) {
        //             console.error(`❌ Failed to create directory: ${TURSO_EMBEDDED_DB_PATH}`);
        //             console.error(err);
        //         }
        //     } else {
        //         console.log("✅ Directory already exists");
        //     }

        //     const NODE_APP_INSTANCE = getOptionalEnvVariable("NODE_APP_INSTANCE") || "0";
        //     console.log("🟦 Using app instance:", NODE_APP_INSTANCE);

        //     let client: ReturnType<typeof createClient> | undefined;
        //     try {
        //         console.log("🟦 Creating database client...");
        //         client = createClient({
        //             url: `file:${TURSO_EMBEDDED_DB_PATH}/INSTANCE_${NODE_APP_INSTANCE}.db`,
        //             authToken: TURSO_DB_TOKEN!,
        //             syncUrl: TURSO_DB_URL!,
        //             syncInterval: 60,
        //         });
        //         console.log("✅ Database client created successfully");
        //     } catch (err) {
        //         console.error("❌ Error creating client");
        //         console.error(err);
        //     }

        //     console.log("🟦 Setting up database sync...");
        //     setTimeout(async () => {
        //         try {
        //             console.log("🟦 Starting database sync");
        //             const res = await client?.sync()
        //             console.log("✅ Sync completed successfully");
        //             console.log("📊 Sync metrics:");
        //             console.log("  - Frame number:", res?.frame_no);
        //             console.log("  - Frames synced:", res?.frames_synced);
        //         } catch (err) {
        //             console.error("❌ Error syncing database");
        //             console.error(err);
        //         }
        //     }, 5e3);

        //     console.log("🟦 Returning drizzle instance with embedded client");
        //     return drizzle(client!, { schema });
        // } else {
        console.log("🟦 Using remote database connection");
        return drizzle({ connection: { url: TURSO_DB_URL!, authToken: TURSO_DB_TOKEN! }, schema });
        // }
    } else {
        console.log("🟦 Using local development database");
        return drizzle(localDbPath, { schema });
    }

};

const db = getDrizzleDb();
export default db;