import db from "@db/drizzle";
import { orderTable } from "@db/schema/order.schema";
import { and, eq, lt, isNull, or } from "drizzle-orm";
import { ORDER_STATUS_OBJ } from "@lib/types/orderStatus";

export const get_OnlinePaymentOrders_NotVerified_After10Minutes_Service = async (
    timeFrame: number = 10 * 60 * 1000, // 10 minutes
) => {
    const _MinutesAgo = new Date(Date.now() - timeFrame);
    return await db.query.orderTable.findMany({
        columns: {
            orderId: true,
            userEmail: true,
            websiteDefaultHostname: true,
            storeName: true,
            isOnlinePaymentNotVerifiedEmailNotificationSent: true,
        },
        where: and(
            eq(orderTable.orderStatus, ORDER_STATUS_OBJ.CREATED),
            eq(orderTable.isOnlinePayment, true),
            or(
                eq(orderTable.isOnlinePaymentNotVerifiedEmailNotificationSent, false),
                isNull(orderTable.isOnlinePaymentNotVerifiedEmailNotificationSent)
            ),
            or(
                eq(orderTable.isOnlinePaymentVerified, false),
                isNull(orderTable.isOnlinePaymentVerified)
            ),
            lt(orderTable.real_created_at_ts, _MinutesAgo.getTime())
        ),
        with: {
            stripeData: {
                columns: {
                    checkoutSessionId: true,
                    paymentIntentId: true,
                    storeStripeConnectAccountId: true,
                },
            },
        }
    });
}