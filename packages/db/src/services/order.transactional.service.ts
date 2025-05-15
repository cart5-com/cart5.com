import db from "@db/drizzle";
import { orderTable, orderStatusHistoryTable } from "@db/schema/order.schema";
import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { ORDER_STATUS_OBJ, type OrderStatus } from "@lib/types/orderStatus";
import { KNOWN_ERROR } from "@lib/types/errors";
import type { OrderStatusChangedByType } from "@lib/types/orderStatusChangedByEnum";

export const saveOrderDataTransactional_Service = async (
    orderId: string,
    orderData: Partial<InferInsertModel<typeof orderTable>>,
    statusChange?: {
        newStatus: OrderStatus,
        changedByUserId?: string,
        changedByIpAddress?: string,
        type: OrderStatusChangedByType,
        metaData?: Record<string, any>
    },
) => {
    return await db.transaction(async (tx) => {
        // Step 1: Check if order exists
        const oldOrdersCheck = await tx
            .select({ orderId: orderTable.orderId })
            .from(orderTable)
            .where(eq(orderTable.orderId, orderId));
        if (oldOrdersCheck.length > 0) {
            throw new KNOWN_ERROR("OrderId already exists", "ORDER_ID_ALREADY_EXISTS");
        }

        // Step 2: Update order data
        await tx.insert(orderTable)
            .values({ ...orderData, orderId } as InferInsertModel<typeof orderTable>)
            .onConflictDoNothing();

        // Step 3: Log status change if requested
        await handleStatusChange_Service(orderId, tx, statusChange);

        return true;
    });
};

export const saveOrderAfterStipePaymentVerification_Service = async (
    orderId: string,
    statusChange?: {
        newStatus: OrderStatus,
        changedByUserId?: string,
        changedByIpAddress?: string,
        type: OrderStatusChangedByType,
        metaData?: Record<string, any>
    },
) => {
    return await db.transaction(async (tx) => {
        // Step 1: Update order data
        await tx.update(orderTable).set({
            orderStatus: ORDER_STATUS_OBJ.CREATED,
            isOnlinePaymentVerified: true,
            created_at_ts: Date.now(),
        }).where(eq(orderTable.orderId, orderId));

        // Step 2: Log status change if requested
        await handleStatusChange_Service(orderId, tx, statusChange);

        return true;
    });
}

export const handleStatusChange_Service = async (
    orderId: string,
    tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
    statusChange?: {
        newStatus: OrderStatus,
        changedByUserId?: string,
        changedByIpAddress?: string,
        type: OrderStatusChangedByType,
        metaData?: Record<string, any>
    },
) => {
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
}

