import { getStoreAutomationRules_Service } from '@db/services/store.service';
import { acceptOrder } from "@api-hono/utils/orders/acceptOrder";
import { autoPrint_taskCreate_Service } from "@db/services/autoprint.service";
import { sendNotificationToTaskListenerDevice } from "@api-hono/routes/api_autoprint_tasks/listen_tasks.controller";
import type { getOrderData_Service } from '@db/services/order.service';
import { sendNotificationToStore } from '@api-hono/routes/api_orders/listen_store.controller';

/**
 *  Run when order status created, stripe orders are not created at first
 */
export const newOrderPlaced_Automations_handler = async (
    order: Awaited<ReturnType<typeof getOrderData_Service>>,
    storeId: string,
    newOrderId: string,
    locale: string | undefined = undefined,
) => {
    const storeAutomationRules = await getStoreAutomationRules_Service(storeId, {
        autoAcceptOrders: true,
        autoPrintRules: true
    });
    if (storeAutomationRules?.autoAcceptOrders) {
        await acceptOrder(storeId, newOrderId, undefined, undefined, 'automatic_rule');
    }
    if (storeAutomationRules?.autoPrintRules) {
        const autoPrintDeviceIds = await autoPrint_taskCreate_Service(
            order,
            newOrderId,
            storeId,
            storeAutomationRules.autoPrintRules,
            locale
        );
        for (const deviceId of autoPrintDeviceIds) {
            sendNotificationToTaskListenerDevice(deviceId, {
                message: 'new task'
            });
        }
    }
    sendNotificationToStore(storeId, {
        orderId: newOrderId
    });
}