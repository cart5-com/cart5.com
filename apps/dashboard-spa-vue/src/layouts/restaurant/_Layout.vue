<script setup lang=ts>
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import Sidebar from './Sidebar.vue'
import { setCurrentRestaurantId } from '@src/stores/RestaurantStore';
import { RouterView, useRoute } from "vue-router";
import Header from '@src/components/Header.vue'
const route = useRoute();
const restaurantId = route.params.restaurantId;
setCurrentRestaurantId(restaurantId as string);

</script>

<template>
    <SidebarProvider>
        <Sidebar />
        <SidebarInset>
            <Header>
                <SidebarTrigger class="-ml-1" />
            </Header>
            <main class="flex-1 lg:max-w-3xl border-r border-foreground/10 p-2 lg:p-4">
                <RouterView />
            </main>
        </SidebarInset>
    </SidebarProvider>
</template>