<script setup lang=ts>
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import WebsiteSidebar from './WebsiteSidebar.vue'
import { setCurrentWebsiteId } from '@dashboard-spa-vue/stores/MyWebsitesStore';
import { RouterView, useRoute } from "vue-router";
import Header from '@dashboard-spa-vue/components/Header.vue'
import { pageTitle } from '@dashboard-spa-vue/stores/LayoutStore';
const route = useRoute();
const websiteId = route.params.websiteId;
setCurrentWebsiteId(websiteId as string);

</script>

<template>
    <SidebarProvider>
        <WebsiteSidebar />
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