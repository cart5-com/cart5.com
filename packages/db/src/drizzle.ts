import { drizzle } from "drizzle-orm/libsql";
import { localDbPath } from "@lib/consts";
import { IS_PROD, getEnvVariable } from "@lib/utils/getEnvVariable";

import * as authSchema from './schema/auth.schema';
import * as restaurantSchema from './schema/restaurant.schema';
import * as websiteSchema from './schema/website.schema';
import * as teamSchema from './schema/team.schema';
// import { createClient } from '@libsql/client';

export const schema = {
    ...authSchema,
    ...restaurantSchema,
    ...websiteSchema,
    ...teamSchema
};

export const getDrizzleDb = function (): ReturnType<typeof drizzle<typeof schema>> {
    // TODO: update env names to remove AUTH etc..
    // const {
    //     AUTHAPI_TURSO_DB_URL,
    //     AUTHAPI_TURSO_DB_TOKEN,
    //     // AUTHAPI_TURSO_EMBEDDED_DB_PATH
    // } = process.env;
    const AUTHAPI_TURSO_DB_URL = getEnvVariable("AUTHAPI_TURSO_DB_URL");
    const AUTHAPI_TURSO_DB_TOKEN = getEnvVariable("AUTHAPI_TURSO_DB_TOKEN");
    if (IS_PROD) {
        // DISABLED BECAUSE UNABLE TO DETECT ERROR: 
        // libsql:: replication: replicator sync error: replication error: Injector error: SQLite error: database disk image is malformed
        // coolify does not support graceful shutdown. I believe it's because of this.
        // if (AUTHAPI_TURSO_EMBEDDED_DB_PATH) {
        //     const client = createClient({
        //         url: `file:${AUTHAPI_TURSO_EMBEDDED_DB_PATH}`,
        //         authToken: AUTHAPI_TURSO_DB_TOKEN!,
        //         syncUrl: AUTHAPI_TURSO_DB_URL!,
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
        return drizzle({ connection: { url: AUTHAPI_TURSO_DB_URL!, authToken: AUTHAPI_TURSO_DB_TOKEN! }, schema });
        // }
    } else {
        return drizzle(localDbPath, { schema });
    }

};

const db = getDrizzleDb();
export default db;