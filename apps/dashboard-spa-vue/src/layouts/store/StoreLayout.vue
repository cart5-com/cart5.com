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

const route = useRoute();
const storeId = route.params.storeId;
setCurrentStoreId(storeId as string);

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