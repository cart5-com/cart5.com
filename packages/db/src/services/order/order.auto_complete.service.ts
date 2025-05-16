import db from "@db/drizzle";
import { orderOnlinePaymentFlagsTable, orderTable } from "@db/schema/order.schema";
import { and, eq, lt } from "drizzle-orm";
import { ORDER_STATUS_OBJ } from "@lib/types/orderStatus";
import { logOrderStatusChange_Service } from "../order.service";

export const getAcceptedOrders_toCheckAndComplete_after24Hours_Service = async (
    timeFrame: number = 60 * 60 * 1000 * 24, // 24 hours
) => {
    const _24HoursAgo = new Date(Date.now() - timeFrame);
    return await db.query.orderTable.findMany({
        columns: {
            orderId: true,
            paymentId: true,
        },
        where: and(
            eq(orderTable.orderStatus, ORDER_STATUS_OBJ.ACCEPTED),
            lt(orderTable.created_at_ts, _24HoursAgo.getTime())
        ),
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
        // orderBy: [desc(orderTable.real_created_at_ts)],
    });
}

// only system can complete an order
export const completeOrder_Service = async (
    orderId: string,
    isOnlinePaymentCaptured: boolean | undefined = undefined,
) => {
    const newStatus = ORDER_STATUS_OBJ.COMPLETED_BY_SYSTEM;

    // Update order status
    const result = await db.update(orderTable).set({
        orderStatus: newStatus,
    })
        .where(
            and(
                eq(orderTable.orderId, orderId),
                eq(orderTable.orderStatus, ORDER_STATUS_OBJ.ACCEPTED)
            )
        );
    if (isOnlinePaymentCaptured) {
        await db.update(orderOnlinePaymentFlagsTable).set({
            isOnlinePaymentCaptured: true,
        }).where(eq(orderOnlinePaymentFlagsTable.orderId, orderId));
    }

    // Log status change if update was successful
    if (result.rowsAffected > 0) {
        await logOrderStatusChange_Service({
            orderId,
            newStatus,
            changedByUserId: undefined,
            changedByIpAddress: undefined,
            type: 'system',
        });
    }

    return result;
}