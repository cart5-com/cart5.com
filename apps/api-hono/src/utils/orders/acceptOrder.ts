import { acceptOrder_Service, getStoreOrders_Service } from "@db/services/order.service";
import type { OrderStatusChangedByType } from "@lib/types/orderStatusChangedByEnum";
import { sendNotificationToStore } from "@api-hono/routes/api_orders/listen_store.controller";
import { orderAcceptedEmail } from "@api-hono/utils/email";

export const acceptOrder_handler = async (
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
        const orders = await getStoreOrders_Service(storeId, [orderId], {
            userEmail: true,
            storeName: true,
            orderId: true,
            websiteDefaultHostname: true,
        })
        if (orders[0] && orders[0].userEmail) {
            orderAcceptedEmail(
                orders[0].userEmail,
                orders[0].storeName,
                orders[0].orderId,
                orders[0].websiteDefaultHostname
            );
        }
    }
    return acceptedOrderResult.rowsAffected;
}