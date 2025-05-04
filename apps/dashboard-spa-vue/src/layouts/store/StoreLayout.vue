<script setup lang=ts>
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import StoreSidebar from './StoreSidebar.vue'
import { setCurrentStoreId } from '@dashboard-spa-vue/stores/MyStoresStore';
import { RouterView, useRoute } from "vue-router";
import Header from '@dashboard-spa-vue/components/Header.vue'
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
import { createOrdersApiClient } from '@api-client/orders';
import { onMounted } from 'vue';

const route = useRoute();
const storeId = route.params.storeId;
setCurrentStoreId(storeId as string);

let storeEventSource: EventSource | null = null
const connectToNotifyStore = () => {
    // const connectToNotifyStore = () => {
    console.log("connectToNotifyStore")
    const url = createOrdersApiClient(`${window.location.origin}/__p_api/orders/`)[":storeId"].notify.$url({
        param: {
            storeId: storeId as string
        }
    })
    storeEventSource = new EventSource(url.toString(), {
        withCredentials: true
    });

    storeEventSource.onmessage = (event) => {
        console.log(JSON.parse(event.data));
    };

    storeEventSource.onerror = (event) => {
        console.log("onerror");
        console.log(event);
        if (storeEventSource) {
            storeEventSource.close();
            setTimeout(() => {
                connectToNotifyStore();
            }, 30_000);
        }
    };
}

onMounted(() => {
    connectToNotifyStore();
})


</script>

<template>
    <SidebarProvider>
        <StoreSidebar />
        <SidebarInset>
            <Header>
                <div class="flex items-center gap-2 max-w-40">
                    <SidebarTrigger class="-ml-1" />
                    <h3 class="text-sm font-bold tracking-tight truncate">
                        {{ pageTitle }}
                    </h3>
                </div>
            </Header>
            <main class="flex-1 container max-w-7xl p-2">
                <RouterView />
            </main>
        </SidebarInset>
    </SidebarProvider>
</template>