import { createOrdersApiClient } from '@api-client/orders';
import { MySettingsStore } from '@orders-spa-vue/stores/MySettingsStore';
import { refreshRecentOrderIds, loadOrders } from '@orders-spa-vue/stores/RecentOrdersStore';
import { ref } from 'vue';

// Map of store IDs to their EventSource instances
export const storeEventSources = ref<Map<string, EventSource>>(new Map());
export const hasConnectionError = ref<boolean>(false);

export const listenStoreNotifier = (storeId: string) => {
    // Don't create duplicate connections
    if (storeEventSources.value.has(storeId)) return;

    if (!MySettingsStore.value[storeId]?.isEnabled) return;
    console.log("LISTENING: storeId refreshRecentOrderIds 1111", storeId);
    refreshRecentOrderIds(storeId);

    const url = createOrdersApiClient(`${window.location.origin}/__p_api/orders/`)[":storeId"].listen.$url({
        param: {
            storeId: storeId as string
        }
    })

    const eventSource = new EventSource(url.toString());
    // eventSource.onopen = () => {
    //     console.log(`Store ${storeId} connection opened`);
    // }
    eventSource.onmessage = (event) => {
        if (event.data === 'ping') {
            return
        }
        try {
            const data = JSON.parse(event.data);
            if (data.orderId) {
                loadOrders(storeId, [data.orderId]);
            }
        } catch (error) {
            console.error(error);
            console.log("LISTENING: storeId refreshRecentOrderIds 2222", storeId);
            refreshRecentOrderIds(storeId);
        }
    };

    eventSource.onerror = (event) => {
        console.log(`Store ${storeId} connection error`);
        console.log(event);
        hasConnectionError.value = true;
        disconnectStore(storeId);
        setTimeout(() => {
            hasConnectionError.value = false;
            listenStoreNotifier(storeId);
        }, import.meta.env.DEV ? 3_000 : 30_000);
    };

    storeEventSources.value.set(storeId, eventSource);
}

export const disconnectStore = (storeId: string) => {
    const eventSource = storeEventSources.value.get(storeId);
    if (eventSource) {
        eventSource.close();
        storeEventSources.value.delete(storeId);
    }
    console.log(`Store ${storeId} disconnected`, storeEventSources.value);
}

// export const disconnectAllStores = () => {
//     for (const [_storeId, eventSource] of storeEventSources.value.entries()) {
//         eventSource.close();
//     }
//     storeEventSources.value.clear();
// }