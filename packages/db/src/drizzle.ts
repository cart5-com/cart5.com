import { drizzle } from "drizzle-orm/libsql";
import { localDbPath } from "@lib/consts";
import { IS_PROD, getEnvVariable } from "@lib/utils/getEnvVariable";

import * as authSchema from './schema/auth.schema';
import * as storeSchema from './schema/store.schema';
import * as websiteSchema from './schema/website.schema';
import * as teamSchema from './schema/team.schema';
// import { createClient } from '@libsql/client';

export const schema = {
    ...authSchema,
    ...storeSchema,
    ...websiteSchema,
    ...teamSchema
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
        // DISABLED BECAUSE UNABLE TO DETECT ERROR: 
        // libsql:: replication: replicator sync error: replication error: Injector error: SQLite error: database disk image is malformed
        // coolify does not support graceful shutdown. I believe it's because of this.
        // if (TURSO_EMBEDDED_DB_PATH) {
        //     const client = createClient({
        //         url: `file:${TURSO_EMBEDDED_DB_PATH}`,
        //         authToken: TURSO_DB_TOKEN!,
        //         syncUrl: TURSO_DB_URL!,
        //         syncInterval: 60,
        //     });
        //     setTimeout(() => {
        //         try {
        //             client.sync();
        //         } catch (err) {
        //             console.error("❌❌❌❌Error syncing db");
        //             console.error(err);
        //         }
        //     }, 5e3);
        //     return drizzle(client, { schema });
        // } else {
        return drizzle({ connection: { url: TURSO_DB_URL!, authToken: TURSO_DB_TOKEN! }, schema });
        // }
    } else {
        return drizzle(localDbPath, { schema });
    }

};

const db = getDrizzleDb();
export default db;
// await db.$client.close();