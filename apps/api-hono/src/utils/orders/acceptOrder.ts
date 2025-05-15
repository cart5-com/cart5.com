import { acceptOrder_Service } from "@db/services/order.service";
import type { OrderStatusChangedByType } from "@lib/types/orderStatusChangedByEnum";
import { sendNotificationToStore } from "@api-hono/routes/api_orders/listen_store.controller";

export const acceptOrder = async (
    storeId: string,
    orderId: string,
    userId?: string,
    ipAddress?: string,
    orderStatusChangedBy: OrderStatusChangedByType = 'system',
) => {
    const acceptedOrderResult = await acceptOrder_Service(
        storeId,
        orderId,
        userId,
        ipAddress,
        orderStatusChangedBy
    )
    if (acceptedOrderResult.rowsAffected === 1) {
        sendNotificationToStore(storeId, {
            orderId
        });
        // TODO: send email notification to user once store approves/rejects order
    }
    return acceptedOrderResult.rowsAffected;
}