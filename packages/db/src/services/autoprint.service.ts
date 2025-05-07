import { autoprintDeviceStoreMapTable, autoprintDeviceTable } from "@db/schema/autoprint.schema";
import db from '@db/drizzle';
import { eq, inArray, type InferInsertModel } from 'drizzle-orm';

export const getAutoPrintDevice_Service = async (
    autoprintDeviceId: string,
    columns?: Partial<Record<keyof typeof autoprintDeviceTable.$inferSelect, boolean>>
) => {
    return await db.query.autoprintDeviceTable.findFirst({
        where: eq(autoprintDeviceTable.autoprintDeviceId, autoprintDeviceId),
        columns: columns,
    });
}

export const updateAutoPrintDevice_Service = async (
    autoprintDeviceId: string,
    data: Partial<InferInsertModel<typeof autoprintDeviceTable>>
) => {
    return await db.insert(autoprintDeviceTable)
        .values({ ...data, autoprintDeviceId } as InferInsertModel<typeof autoprintDeviceTable>)
        .onConflictDoUpdate({
            target: autoprintDeviceTable.autoprintDeviceId,
            set: data
        });
}

export const addAutoprintDeviceToStore_Service = async (
    autoprintDeviceId: string,
    storeId: string
) => {
    return await db.insert(autoprintDeviceStoreMapTable).values({ autoprintDeviceId, storeId });
}


// export const getAutoprintDevices_ByStoreIds_Service = async (
//     storeIds: string[]
// ) => {
//     const mappings = await db.query.autoprintDeviceStoreMapTable.findMany({
//         where: inArray(autoprintDeviceStoreMapTable.storeId, storeIds),
//         with: {
//             device: {
//                 columns: {
//                     autoprintDeviceId: true,
//                     name: true,
//                     printers: true
//                 }
//             }
//         }
//     });
//     let result: Record<string, typeof mappings[0]['device'][]> = {};
//     for (const mapping of mappings) {
//         result[mapping.storeId] = mapping.device;
//     }
//     return result;
// }

export const getAutoprintDevices_ByStoreIds_Service_old = async (
    storeIds: string[]
) => {
    const stores = storeIds.map(async (storeId) => {
        return {
            storeId,
            devices: await getAutoprintDevicesByStore_Service(storeId)
        }
    })
    return await Promise.all(stores);
}

export const getAutoprintDevicesByStore_Service = async (
    storeId: string
) => {
    const mappings = await db.query.autoprintDeviceStoreMapTable.findMany({
        where: eq(autoprintDeviceStoreMapTable.storeId, storeId),
        with: {
            device: {
                columns: {
                    autoprintDeviceId: true,
                    name: true,
                    printers: true
                }
            }
        }
    });
    return mappings.map(mapping => mapping.device);
}