import { getAcceptedOrders_toCheckAndComplete_Service } from "@db/services/order.service";

export const checkAndCompleteOrders = async () => {
    const orders = await getAcceptedOrders_toCheckAndComplete_Service();
    for (const order of orders) {

    }
}
