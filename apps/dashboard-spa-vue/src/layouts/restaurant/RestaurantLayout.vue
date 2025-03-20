<script setup lang=ts>
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import RestaurantSidebar from './RestaurantSidebar.vue'
import { setCurrentRestaurantId } from '@dashboard-spa-vue/stores/RestaurantStore';
import { RouterView, useRoute } from "vue-router";
import Header from '@dashboard-spa-vue/components/Header.vue'
import { pageTitle } from '@dashboard-spa-vue/stores/layout.store';
const route = useRoute();
const restaurantId = route.params.restaurantId;
setCurrentRestaurantId(restaurantId as string);

</script>

<template>
    <SidebarProvider>
        <RestaurantSidebar />
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