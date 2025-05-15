import { get_OnlinePaymentOrders_NotVerified_After10Minutes_Service } from "@db/services/order/order.online_payment_not_verified";
import { updateOrderData_Service } from "@db/services/order.service";
import { orderOnlinePaymentNotVerifiedEmail } from "../email";

export const onlinePaymentNotVerified_sendEmailNotification = async () => {
    const orders = await get_OnlinePaymentOrders_NotVerified_After10Minutes_Service();

    for (const order of orders) {
        // Send email notification
        orderOnlinePaymentNotVerifiedEmail(
            order.userEmail,
            order.storeName,
            order.orderId,
            order.websiteDefaultHostname
        );

        // Update order to mark notification as sent
        await updateOrderData_Service(order.orderId, {
            isOnlinePaymentNotVerifiedEmailNotificationSent: true
        });
    }

    return orders.length;
}

