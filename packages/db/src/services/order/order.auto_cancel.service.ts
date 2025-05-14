import db from "@db/drizzle";
import { orderTable } from "@db/schema/order.schema";
import { and, eq, lt } from "drizzle-orm";
import { ORDER_STATUS_OBJ } from "@lib/types/orderStatus";

export const getCreated_butNotAcceptedOrders_after25Minutes_Service = async (
    timeFrame: number = 25 * 60 * 1000, // 25 minutes
    limit: number = 300
) => {
    const _25MinutesAgo = new Date(Date.now() - timeFrame);
    return await db.query.orderTable.findMany({
        columns: {
            orderId: true,
            storeId: true,
            created_at_ts: true,
            paymentId: true,
            isOnlinePaymentVerified: true,
            isOnlinePaymentCaptured: true,
        },
        where: and(
            eq(orderTable.orderStatus, ORDER_STATUS_OBJ.CREATED),
            lt(orderTable.created_at_ts, _25MinutesAgo.getTime())
        ),
        with: {
            stripeData: {
                columns: {
                    checkoutSessionId: true,
                    paymentIntentId: true,
                    storeStripeConnectAccountId: true,
                },
            },
        },
        limit: limit,
        // orderBy: [desc(orderTable.real_created_at_ts)],
    });
}