import { toast } from "@/ui-plus/sonner";
import { ordersApiClient } from "@api-client/orders";
import { ref } from "vue";
import type { ResType } from "@api-client/typeUtils";
import { MySettingsStore } from "@orders-spa-vue/stores/MySettingsStore";

const ApiPath = ordersApiClient[":storeId"].get_by_order_ids.$post;
type RecentOrdersType = ResType<typeof ApiPath>["data"];

const recentOrdersIds = ref<{
    created_at_ts: number;
    orderId: string;
}[]>([]);
export const cachedStoreOrders = ref<Record<string, RecentOrdersType[number]>>({});

let autoLoadTimer: ReturnType<typeof setTimeout> | null = null
export const refreshRecentOrderIds = async (storeId: string) => {
    if (autoLoadTimer) {
        clearTimeout(autoLoadTimer);
    }
    if (!MySettingsStore.value[storeId]?.isEnabled) return;
    const { data, error } = await (await ordersApiClient[":storeId"].recent_orders.$get({
        param: { storeId }
    })).json();
    if (error) {
        toast.error(error.message ?? "Error fetching recent orders");
    } else {
        const newOrderIds: string[] = [];
        recentOrdersIds.value = data;
        data.forEach((order) => {
            // filter new and updated orders from cached orders
            const cachedOrder = cachedStoreOrders.value[order.orderId];
            if (!cachedOrder || cachedOrder.updated_at_ts !== order.updated_at_ts) {
                newOrderIds.push(order.orderId);
            }
        });
        // load new and updated orders
        if (newOrderIds.length > 0) {
            loadOrders(storeId, newOrderIds);
        }
    }

    autoLoadTimer = setTimeout(() => {
        refreshRecentOrderIds(storeId);
    }, 5 * 60_000); // 5 minutes
}

export const loadOrders = async (storeId: string, newOrderIds: string[]) => {
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
        data.forEach((order) => {
            order.statusHistory.sort((a, b) => a.created_at_ts - b.created_at_ts);
            cachedStoreOrders.value[order.orderId] = order;
        });
    }
}