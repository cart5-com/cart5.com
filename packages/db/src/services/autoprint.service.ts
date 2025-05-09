import { autoprintDeviceStoreMapTable, autoprintDeviceTable, autoprintDeviceTaskTable } from "@db/schema/autoprint.schema";
import db from '@db/drizzle';
import { eq, type InferInsertModel, and } from 'drizzle-orm';


export const getDeviceTasks_Service = async (
    autoprintDeviceId: string
) => {
    return await db.query.autoprintDeviceTaskTable.findMany({
        where: eq(autoprintDeviceTaskTable.autoprintDeviceId, autoprintDeviceId),
    });
}

// delete task by taskId and autoprintDeviceId
export const deleteTask_Service = async (
    taskId: string,
    autoprintDeviceId: string
) => {
    return await db.delete(autoprintDeviceTaskTable).where(and(eq(autoprintDeviceTaskTable.taskId, taskId), eq(autoprintDeviceTaskTable.autoprintDeviceId, autoprintDeviceId)));
}

export const getAutoprintDeviceTask_Service = async (
    taskId: string,
    autoprintDeviceId: string,
    columns?: Partial<Record<keyof typeof autoprintDeviceTaskTable.$inferSelect, boolean>>
) => {
    return await db.query.autoprintDeviceTaskTable.findFirst({
        where: and(eq(autoprintDeviceTaskTable.taskId, taskId), eq(autoprintDeviceTaskTable.autoprintDeviceId, autoprintDeviceId)),
        columns: columns,
    });
}

export const updateAutoprintDeviceTask_Service = async (
    taskId: string,
    data: Partial<InferInsertModel<typeof autoprintDeviceTaskTable>>
) => {
    return await db.insert(autoprintDeviceTaskTable)
        .values({ ...data, taskId } as InferInsertModel<typeof autoprintDeviceTaskTable>)
        .onConflictDoUpdate({
            target: autoprintDeviceTaskTable.taskId,
            set: data
        });
}

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


export const getAutoprintDevices_ByStoreIds_Service = async (
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