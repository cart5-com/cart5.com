import db from "@db/drizzle";
import { orderTable, orderStripeDataTable, orderOnlinePaymentFlagsTable } from "@db/schema/order.schema";
import { and, eq, lt, ne } from "drizzle-orm";
import { ORDER_STATUS_OBJ } from "@lib/types/orderStatus";

export const getStoreOrder_forCancel_Service = async (
    storeId: string,
    orderId: string,
) => {
    return await db.query.orderTable.findFirst({
        where: and(
            eq(orderTable.storeId, storeId),
            eq(orderTable.orderId, orderId),
            ne(orderTable.orderStatus, ORDER_STATUS_OBJ.CANCELLED)
        ),
        columns: {
            orderId: true,
            storeId: true,
            created_at_ts: true,
            paymentId: true,
        },
        with: {
            stripeData: {
                columns: {
                    checkoutSessionId: true,
                    paymentIntentId: true,
                    storeStripeConnectAccountId: true,
                },
            },
            onlinePaymentFlags: {
                columns: {
                    isOnlinePaymentVerified: true,
                    isOnlinePaymentCaptured: true,
                }
            }
        },
    });
}

export const getCreated_butNotAcceptedOrders_after25Minutes_withJoin_Service = async (
    timeFrame: number = 25 * 60 * 1000, // 25 minutes
) => {
    const _25MinutesAgo = new Date(Date.now() - timeFrame);
    return await db
        .select({
            orderId: orderTable.orderId,
            storeId: orderTable.storeId,
            created_at_ts: orderTable.created_at_ts,
            paymentId: orderTable.paymentId,
            stripeData: {
                checkoutSessionId: orderStripeDataTable.checkoutSessionId,
                paymentIntentId: orderStripeDataTable.paymentIntentId,
                storeStripeConnectAccountId: orderStripeDataTable.storeStripeConnectAccountId,
            },
            onlinePaymentFlags: {
                isOnlinePaymentVerified: orderOnlinePaymentFlagsTable.isOnlinePaymentVerified,
                isOnlinePaymentCaptured: orderOnlinePaymentFlagsTable.isOnlinePaymentCaptured,
            }
        })
        .from(orderTable)
        .leftJoin(orderStripeDataTable, eq(orderTable.orderId, orderStripeDataTable.orderId))
        .leftJoin(orderOnlinePaymentFlagsTable, eq(orderTable.orderId, orderOnlinePaymentFlagsTable.orderId))
        .where(
            and(
                eq(orderTable.orderStatus, ORDER_STATUS_OBJ.CREATED),
                lt(orderTable.created_at_ts, _25MinutesAgo.getTime())
            )
        );
}