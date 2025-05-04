import { createOrdersApiClient } from '@api-client/orders';
import { ref } from 'vue';

// Map of store IDs to their EventSource instances
export const storeEventSources = ref<Map<string, EventSource>>(new Map());

export const listenStoreNotifier = (storeId: string) => {
    // Don't create duplicate connections
    if (storeEventSources.value.has(storeId)) return;

    const url = createOrdersApiClient(`${window.location.origin}/__p_api/orders/`)[":storeId"].notify.$url({
        param: {
            storeId: storeId as string
        }
    })

    const eventSource = new EventSource(url.toString());
    eventSource.onopen = () => {
        console.log(`Store ${storeId} connection opened`);
    }
    eventSource.onmessage = (event) => {
        if (event.data === 'ping') {
            return
        }
        console.log(storeId, JSON.parse(event.data));
    };

    eventSource.onerror = (event) => {
        console.log(`Store ${storeId} connection error`);
        console.log(event);

        disconnectStore(storeId);
        setTimeout(() => {
            listenStoreNotifier(storeId);
        }, 30_000);
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

export const disconnectAllStores = () => {
    for (const [_storeId, eventSource] of storeEventSources.value.entries()) {
        eventSource.close();
    }
    storeEventSources.value.clear();
}