import db from "@db/drizzle";
import { orderTable, orderStatusHistoryTable } from "@db/schema/order.schema";
import { and, eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { ORDER_STATUS_OBJ, type OrderStatus } from "@lib/types/orderStatus";

export const saveOrderDataTransactional_Service = async (
    orderId: string,
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
    }
) => {
    return await db.transaction(async (tx) => {
        // Step 1: Update order data
        await tx.insert(orderTable)
            .values({ ...orderData, orderId } as InferInsertModel<typeof orderTable>)
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

        return true;
    });
};