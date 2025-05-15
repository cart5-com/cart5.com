import { getCreated_butNotAcceptedOrders_after25Minutes_withJoin_Service } from "@db/services/order/order.cancel.service";
import { cancelOrder } from "./cancelOrder";

// TODO: I should not cancel orders, I should only notify the buyer
export const cancelOldOrders_AbandonedByStore = async () => {
    const orders = await getCreated_butNotAcceptedOrders_after25Minutes_withJoin_Service();
    for (const order of orders) {
        await cancelOrder(order);
    }
}
