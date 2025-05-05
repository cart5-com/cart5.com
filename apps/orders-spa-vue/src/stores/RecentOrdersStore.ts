import { toast } from "@/ui-plus/sonner";
import { ordersApiClient } from "@api-client/orders";
import { ref } from "vue";
import type { ResType } from "@api-client/typeUtils";
const ApiPath = ordersApiClient[":storeId"].get_by_order_ids.$post;
type RecentOrdersType = ResType<typeof ApiPath>["data"];

const recentOrdersIds = ref<{
    created_at_ts: number;
    orderId: string;
}[]>([]);
export const cachedStoreOrders = ref<RecentOrdersType>([]);

export const loadAndSetRecentOrdersIds = async (storeId: string) => {
    const { data, error } = await (await ordersApiClient[":storeId"].recent_orders.$get({
        param: { storeId }
    })).json();
    if (error) {
        toast.error(error.message ?? "Error fetching recent orders");
        return;
    } else {
        const newOrderIds: string[] = [];
        recentOrdersIds.value = data;
        data.forEach((order) => {
            if (!cachedStoreOrders.value.find((o) => o.orderId === order.orderId)) {
                newOrderIds.push(order.orderId);
            }
        });
        if (newOrderIds.length > 0) {
            const { data, error } = await (await ordersApiClient[":storeId"].get_by_order_ids.$post({
                param: { storeId },
                json: {
                    orderIds: newOrderIds,
                    // columns: {
                    //     orderId: true,
                    //     orderType: true,
                    //     orderStatus: true,
                    //     orderTotal: true,
                    //     orderNote: true,
                    //     orderCreatedAtTs: true,
                    //     orderUpdatedAtTs: true,
                    //     orderCreatedAt: true,
                    //     orderUpdatedAt: true,
                    //     created_at_ts: true,
                    // }
                },

            })).json();
            if (error) {
                toast.error(error.message ?? "Error fetching recent orders");
                return;
            } else {
                cachedStoreOrders.value = [...data, ...cachedStoreOrders.value]
                    .sort((a, b) => b.created_at_ts - a.created_at_ts);
            }
        }
    }
}

