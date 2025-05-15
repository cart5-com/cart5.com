import db from "@db/drizzle";
import { orderTable, orderOnlinePaymentFlagsTable } from "@db/schema/order.schema";
import { and, eq, lt, isNull, or } from "drizzle-orm";
import { ORDER_STATUS_OBJ } from "@lib/types/orderStatus";

export const get_OnlinePaymentOrders_NotVerified_After10Minutes_Service = async (
    timeFrame: number = 10 * 60 * 1000, // 10 minutes
) => {
    const _MinutesAgo = new Date(Date.now() - timeFrame);
    return await db
        .select({
            orderId: orderTable.orderId,
            userEmail: orderTable.userEmail,
            websiteDefaultHostname: orderTable.websiteDefaultHostname,
            storeName: orderTable.storeName,
            isOnlinePaymentNotVerifiedEmailNotificationSent: orderOnlinePaymentFlagsTable.isOnlinePaymentNotVerifiedEmailNotificationSent,
            isOnlinePaymentVerified: orderTable.isOnlinePaymentVerified
        })
        .from(orderTable)
        .leftJoin(
            orderOnlinePaymentFlagsTable,
            eq(orderTable.orderId, orderOnlinePaymentFlagsTable.orderId)
        )
        .where(and(
            eq(orderTable.orderStatus, ORDER_STATUS_OBJ.PENDING_PAYMENT_AUTHORIZATION),
            eq(orderTable.isOnlinePayment, true),
            lt(orderTable.real_created_at_ts, _MinutesAgo.getTime()),
            or(
                eq(orderOnlinePaymentFlagsTable.isOnlinePaymentNotVerifiedEmailNotificationSent, false),
                isNull(orderOnlinePaymentFlagsTable.isOnlinePaymentNotVerifiedEmailNotificationSent)
            ),
            or(
                eq(orderTable.isOnlinePaymentVerified, false),
                isNull(orderTable.isOnlinePaymentVerified)
            )
        ));
}