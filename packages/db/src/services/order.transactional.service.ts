import db from "@db/drizzle";
import { orderTable, orderStatusHistoryTable } from "@db/schema/order.schema";
import { and, eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { ORDER_STATUS_OBJ, type OrderStatus } from "@lib/types/orderStatus";
import { autoprintDeviceTaskTable } from "@db/schema/autoprint.schema";
import type { AutoprintRulesListType } from "@lib/zod/AutoprintRules";
import { generateKey } from "@lib/utils/generateKey";
import { thermalPrinterFormat } from "@lib/utils/printerFormat";
import { sendNotificationToTaskListenerDevice } from "@api-hono/routes/api_autoprint_tasks/listen_tasks.controller";

export const saveOrderDataTransactional_Service = async (
    orderId: string,
    shortOtp: string,
    orderData: Partial<InferInsertModel<typeof orderTable>>,
    statusChange?: {
        newStatus: OrderStatus,
        changedByUserId?: string,
        changedByIpAddress?: string,
        type: 'user' | 'automatic_rule' | 'system',
        metaData?: Record<string, any>
    },
    acceptParams?: {
        storeId: string,
        changedByUserId?: string,
        changedByIpAddress?: string,
        type?: 'user' | 'automatic_rule' | 'system'
    },
    autoPrintParams?: {
        storeId: string,
        autoPrintRules?: AutoprintRulesListType
    }
) => {
    return await db.transaction(async (tx) => {
        // Step 1: Update order data
        await tx.insert(orderTable)
            .values({ ...orderData, orderId, shortOtp } as InferInsertModel<typeof orderTable>)
            .onConflictDoUpdate({
                target: orderTable.orderId,
                set: orderData
            });

        // Step 2: Log status change if requested
        if (statusChange) {
            await tx.insert(orderStatusHistoryTable).values({
                orderId,
                newStatus: statusChange.newStatus,
                type: statusChange.type ?? 'user',
                changedByUserId: statusChange.changedByUserId,
                changedByIpAddress: statusChange.changedByIpAddress,
                metaData: statusChange.metaData ? JSON.stringify(statusChange.metaData) : null
            });
        }

        // Step 3: Accept order if requested
        if (acceptParams) {
            const newStatus = ORDER_STATUS_OBJ.ACCEPTED;

            // Update order status checking current status is CREATED
            const result = await tx.update(orderTable).set({
                orderStatus: newStatus,
            })
                .where(
                    and(
                        eq(orderTable.orderId, orderId),
                        eq(orderTable.storeId, acceptParams.storeId),
                        eq(orderTable.orderStatus, ORDER_STATUS_OBJ.CREATED)
                    )
                );

            // Log status change if update was successful
            if (result.rowsAffected > 0) {
                await tx.insert(orderStatusHistoryTable).values({
                    orderId,
                    newStatus,
                    type: acceptParams.type ?? 'user',
                    changedByUserId: acceptParams.changedByUserId,
                    changedByIpAddress: acceptParams.changedByIpAddress,
                    metaData: null
                });
            }
        }

        // Step 4: Create autoprint tasks if requested
        if (autoPrintParams?.autoPrintRules && autoPrintParams.autoPrintRules.length > 0) {
            const activeRules = autoPrintParams.autoPrintRules.filter(rule =>
                rule.isActive && rule.autoprintDeviceId && rule.printerDeviceName);

            if (activeRules.length > 0) {
                orderData.shortOtp = shortOtp;
                type inputType = Parameters<typeof thermalPrinterFormat>[0];
                const html = thermalPrinterFormat(orderData as inputType);
                const uniqueDeviceIds: Record<string, boolean> = {};
                for (const rule of activeRules) {
                    await tx.insert(autoprintDeviceTaskTable).values({
                        taskId: generateKey('apt'),
                        autoprintDeviceId: rule.autoprintDeviceId as string,
                        deviceName: rule.printerDeviceName as string,
                        copies: rule.copies || 1,
                        storeId: autoPrintParams.storeId,
                        orderId: orderId,
                        autoAcceptOrderAfterPrint: rule.autoAcceptOrderAfterPrint || false,
                        html
                    });
                    uniqueDeviceIds[rule.autoprintDeviceId as string] = true;
                }
                for (const deviceId of Object.keys(uniqueDeviceIds)) {
                    sendNotificationToTaskListenerDevice(deviceId, {
                        message: 'new task'
                    });
                }
            }
        }

        return true;
    });
};