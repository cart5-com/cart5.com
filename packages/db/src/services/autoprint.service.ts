import { autoprintDeviceStoreMapTable, autoprintDeviceTable } from "@db/schema/autoprint.schema";
import { eq, type InferInsertModel, and } from 'drizzle-orm';
import type { PrintersType } from "@lib/zod/Printers";
import db from "@db/drizzle";
import { autoprintDeviceTaskTable } from "@db/schema/autoprint.schema";
import type { AutoprintRulesListType } from "@lib/zod/AutoprintRules";
import { generateKey } from "@lib/utils/generateKey";
import { thermalPrinterFormat } from "@lib/utils/printerFormat";
import type { getOrderData_Service } from "./order.service";


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

// export const updateAutoprintDeviceTask_Service = async (
//     taskId: string,
//     data: Partial<InferInsertModel<typeof autoprintDeviceTaskTable>>
// ) => {
//     return await db.insert(autoprintDeviceTaskTable)
//         .values({ ...data, taskId } as InferInsertModel<typeof autoprintDeviceTaskTable>)
//         .onConflictDoUpdate({
//             target: autoprintDeviceTaskTable.taskId,
//             set: data
//         });
// }

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

export const setPrinters_Service = async (
    autoprintDeviceId: string,
    printers: PrintersType
) => {
    return await db.update(autoprintDeviceTable).set({
        printers
    }).where(eq(autoprintDeviceTable.autoprintDeviceId, autoprintDeviceId));
}

export const autoPrint_taskCreate_Service = async (
    orderData: Awaited<ReturnType<typeof getOrderData_Service>>,
    orderId: string,
    storeId: string,
    autoPrintRules?: AutoprintRulesListType,
    locale: string | undefined = undefined,
) => {
    const uniqueDeviceIds: Record<string, boolean> = {};
    if (autoPrintRules && autoPrintRules.length > 0) {
        const activeRules = autoPrintRules.filter(rule =>
            rule.isActive && rule.autoprintDeviceId && rule.printerDeviceName);
        if (activeRules.length > 0) {
            type inputType = Parameters<typeof thermalPrinterFormat>[0]; // build gives error, but I see no error here
            const html = thermalPrinterFormat(orderData as inputType, locale);
            for (const rule of activeRules) {
                await db.insert(autoprintDeviceTaskTable).values({
                    taskId: generateKey('apt'),
                    autoprintDeviceId: rule.autoprintDeviceId as string,
                    deviceName: rule.printerDeviceName as string,
                    copies: rule.copies || 1,
                    storeId,
                    orderId: orderId,
                    autoAcceptOrderAfterPrint: rule.autoAcceptOrderAfterPrint || false,
                    html
                });
                uniqueDeviceIds[rule.autoprintDeviceId as string] = true;
            }
        }
    }
    // TODO: send notifications after autoPrint_taskCreate_Service called
    // for (const deviceId of Object.keys(uniqueDeviceIds)) {
    //     sendNotificationToTaskListenerDevice(deviceId, {
    //         message: 'new task'
    //     });
    // }
    return Object.keys(uniqueDeviceIds);
}
