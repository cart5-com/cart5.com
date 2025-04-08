import { storeRecentlyUpdatedTable } from "@db/schema/store.schema";
import { eq, desc } from "drizzle-orm";
import db from "@db/drizzle";
import { getStoreData_Service } from "@db/services/store.service";
import { r2TextUpload } from "@lib/upload/r2actions";
import { getEnvVariable, IS_PROD } from "@lib/utils/getEnvVariable";

if (!IS_PROD) {
    console.log("NODE_TLS_REJECT_UNAUTHORIZED disabled for DEV ONLY");
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const getStoreData_CacheJSON = async (
    storeId: string,
    forceDb: boolean = false
) => {
    try {
        if (forceDb) {
            throw new Error("Force DB");
        }
        const jsonUrl = `https://${getEnvVariable("PUBLIC_CLOUDFLARE_R2_PUBLIC_HOST")}/store-data-full/${storeId}.json`;
        const json = await fetch(jsonUrl);
        if (!json.ok) {
            throw new Error("Failed to fetch store data");
        }
        const jsonData = await json.json() as ReturnType<typeof getStoreData_Service>;
        return jsonData;
    } catch (e) {
        try {
            const storeData = await getStoreData_Service(storeId);
            if (!storeData) {
                return undefined;
            }
            const jsonCreatedAt = Date.now();
            (storeData as any).source = "JSON_CACHE";
            (storeData as any).jsonCreatedAt = jsonCreatedAt;
            (storeData as any).isoJsonCreatedAt = new Date(jsonCreatedAt).toISOString();
            await r2TextUpload(JSON.stringify(storeData), `store-data-full/${storeId}.json`, 'application/json');
            await r2TextUpload(JSON.stringify(storeData.openHours), `store-data-open-hours/${storeId}.json`, 'application/json');
            await r2TextUpload(JSON.stringify({
                deliveryZones: storeData.deliveryZones,
                address: storeData.address,
            }), `store-data-delivery-zones-and-address/${storeId}.json`, 'application/json');
            (storeData as any).source = "DB";
            await removeAsUpdatedQueue(storeId);
            return storeData;
        } catch (e2) {
            console.error("Error getting store data:");
            console.error(e2);
            return undefined;
        }
    }

}




export const removeAsUpdatedQueue = async (storeId: string) => {
    await db.delete(storeRecentlyUpdatedTable)
        .where(eq(storeRecentlyUpdatedTable.storeId, storeId))
}

export const listAllUpdatedStoresQueue = async () => {
    return await db.select()
        .from(storeRecentlyUpdatedTable)
        .orderBy(desc(storeRecentlyUpdatedTable.created_at_ts));
}

export const listAndUploadAllUpdatedStores = async () => {
    const stores = await listAllUpdatedStoresQueue();
    // delete all the stores from the queue
    await db.delete(storeRecentlyUpdatedTable);
    for (const store of stores) {
        await getStoreData_CacheJSON(store.storeId, true);
    }
}

export const markStoreAsUpdated = async (storeId: string) => {
    if (process.env.npm_lifecycle_event === 'dev:seed') {
        return;
    } else if (IS_PROD) {
        await db
            .insert(storeRecentlyUpdatedTable)
            .values({ storeId })
            .onConflictDoNothing();
    } else {
        // Refresh the cache immediately in dev
        await getStoreData_CacheJSON(storeId, true);
    }
};