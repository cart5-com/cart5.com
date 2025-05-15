import db from "@db/drizzle";
import { orderTable, orderStatusHistoryTable, orderStripeDataTable } from "@db/schema/order.schema";
import { and, desc, eq, gte, inArray, ne } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { ORDER_STATUS_OBJ, type OrderStatus } from "@lib/types/orderStatus";
import type { OrderStatusChangedByType } from "@lib/types/orderStatusChangedByEnum";

export const logOrderStatusChange_Service = async ({
    orderId,
    newStatus,
    changedByUserId,
    changedByIpAddress,
    type,
    metaData
}: {
    orderId: string;
    newStatus: OrderStatus;
    changedByUserId?: string;
    changedByIpAddress?: string;
    type: OrderStatusChangedByType;
    metaData?: Record<string, any>;
}) => {
    return await db.insert(orderStatusHistoryTable).values({
        orderId,
        newStatus,
        type: type ?? 'user',
        changedByUserId,
        changedByIpAddress,
        metaData: metaData ? JSON.stringify(metaData) : null
    });
}

export const getUserOrderData_Service = async (
    orderId: string,
    userId: string,
    columns?: Partial<Record<keyof typeof orderTable.$inferSelect, boolean>>
) => {
    return await db.query.orderTable.findFirst({
        where: and(eq(orderTable.orderId, orderId), eq(orderTable.userId, userId)),
        columns: columns,
    });
}

export const getOrderData_Service = async (
    orderId: string,
    columns?: Partial<Record<keyof typeof orderTable.$inferSelect, boolean>>
) => {
    return await db.query.orderTable.findFirst({
        where: eq(orderTable.orderId, orderId),
        columns: columns,
    });
}

export const getStoreOrders_Service = async (
    storeId: string,
    orderIds: string[],
    columns?: Partial<Record<keyof typeof orderTable.$inferSelect, boolean>>
) => {
    // TODO: is using inArray secure to prevent reading other store's orders?
    return await db.query.orderTable.findMany({
        where: and(eq(orderTable.storeId, storeId), inArray(orderTable.orderId, orderIds)),
        columns: columns,
        with: {
            statusHistory: true,
        }
    });
}

// TODO: sendNotificationToStore when status change?
// only created orders can be accepted
export const acceptOrder_Service = async (
    storeId: string,
    orderId: string,
    changedByUserId?: string,
    changedByIpAddress?: string,
    type: OrderStatusChangedByType = 'user',
) => {
    const newStatus = ORDER_STATUS_OBJ.ACCEPTED;

    // Update order status
    const result = await db.update(orderTable).set({
        orderStatus: newStatus,
    })
        .where(
            and(
                eq(orderTable.orderId, orderId),
                eq(orderTable.storeId, storeId),
                eq(orderTable.orderStatus, ORDER_STATUS_OBJ.CREATED)
            )
        );

    // Log status change if update was successful
    if (result.rowsAffected > 0) {
        await logOrderStatusChange_Service({
            orderId,
            newStatus,
            changedByUserId,
            changedByIpAddress,
            type,
        });
    }

    return result;
}



// only non-cancelled orders can be cancelled
export const cancelOrder_Service = async (
    storeId: string,
    orderId: string,
    changedByUserId?: string,
    changedByIpAddress?: string,
    type: OrderStatusChangedByType = 'user',
    isOnlinePaymentCancelledOrRefunded: boolean | undefined = undefined,
) => {
    const newStatus = ORDER_STATUS_OBJ.CANCELLED;

    // Update order status
    const result = await db.update(orderTable).set({
        orderStatus: newStatus,
        isOnlinePaymentCancelledOrRefunded
    }).where(
        and(
            eq(orderTable.orderId, orderId),
            eq(orderTable.storeId, storeId),
            ne(orderTable.orderStatus, ORDER_STATUS_OBJ.CANCELLED)
        )
    );

    // Log status change if update was successful
    if (result.rowsAffected > 0) {
        // TODO: notify user and store
        await logOrderStatusChange_Service({
            orderId,
            newStatus,
            changedByUserId,
            changedByIpAddress,
            type,
        });
    }

    return result;
}

export const updateOrderData_Service = async (
    orderId: string,
    data: Partial<InferInsertModel<typeof orderTable>>
) => {
    return await db.insert(orderTable)
        .values({ ...data, orderId } as InferInsertModel<typeof orderTable>)
        .onConflictDoUpdate({
            target: orderTable.orderId,
            set: data
        });
}

const RECENT_ORDERS_TIME_FRAME = 60 * 60 * 1000 * 24; // 24 hours
export const getRecentOrders_Service = async (
    storeId: string
) => {
    // last 6 hours
    const _24HoursAgo = new Date(Date.now() - RECENT_ORDERS_TIME_FRAME);
    // but status can not be PENDING_PAYMENT_AUTHORIZATION
    return await db.query.orderTable.findMany({
        columns: {
            orderId: true,
            created_at_ts: true,
            updated_at_ts: true,
        },
        where: and(
            eq(orderTable.storeId, storeId),
            gte(orderTable.created_at_ts, _24HoursAgo.getTime()),
            ne(orderTable.orderStatus, ORDER_STATUS_OBJ.PENDING_PAYMENT_AUTHORIZATION)
        ),
        orderBy: [desc(orderTable.created_at_ts)],
    });
}



export const getOrderStripeData_Service = async (
    orderId: string,
    columns?: Partial<Record<keyof typeof orderStripeDataTable.$inferSelect, boolean>>
) => {
    return await db.query.orderStripeDataTable.findFirst({
        where: eq(orderStripeDataTable.orderId, orderId),
        columns: columns,
    });
}

export const updateOrderStripeData_Service = async (
    orderId: string,
    data: Partial<InferInsertModel<typeof orderStripeDataTable>>
) => {
    const result = await db.insert(orderStripeDataTable)
        .values({ ...data, orderId: orderId })
        .onConflictDoUpdate({
            target: orderStripeDataTable.orderId,
            set: data
        });
    return result;
}