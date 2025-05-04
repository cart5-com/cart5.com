import { createOrdersApiClient } from '@api-client/orders';

// Map of store IDs to their EventSource instances
const storeEventSources = new Map<string, EventSource>();

export const listenStoreNotifier = (storeId: string) => {
    // Don't create duplicate connections
    if (storeEventSources.has(storeId)) return;

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

    storeEventSources.set(storeId, eventSource);
}

export const disconnectStore = (storeId: string) => {
    const eventSource = storeEventSources.get(storeId);
    if (eventSource) {
        eventSource.close();
        storeEventSources.delete(storeId);
    }
}

export const disconnectAllStores = () => {
    for (const [_storeId, eventSource] of storeEventSources.entries()) {
        eventSource.close();
    }
    storeEventSources.clear();
}