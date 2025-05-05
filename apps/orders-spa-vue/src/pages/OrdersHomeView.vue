<script lang="ts" setup>
import { AlertCircle, Eye, Loader2, Play, Settings2 } from "lucide-vue-next";
import { myStores, isMyStoresLoading } from '@orders-spa-vue/stores/MyStoresStore'
import HeaderOnly from '@orders-spa-vue/layouts/HeaderOnly.vue';
import { Button } from "@/components/ui/button";
import { storeEventSources, hasConnectionError } from "@orders-spa-vue/utils/listenStoreNotifier";
import { computed, onMounted, ref } from "vue";
import { playBlankAudioLoop, isAbleToPlayAudio } from "@orders-spa-vue/utils/playAudio";
import { cachedStoreOrders } from "@orders-spa-vue/stores/RecentOrdersStore";
import { formatDate } from "@lib/utils/formatDate";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Dialog, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogScrollContent, DialogClose, DialogFooter } from "@/components/ui/dialog";
import SettingsView from "./SettingsView.vue";

const reload = () => {
    window.location.reload();
}

onMounted(() => {
    playBlankAudioLoop();
});

const orders = computed(() => {
    return Object.values(cachedStoreOrders.value).sort((a, b) => b.created_at_ts - a.created_at_ts);
});

const isSettingsDialogOpen = ref(false);

</script>

<template>
    <HeaderOnly>
        <!-- <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-col gap-1">
                <h3 class="text-2xl font-bold tracking-tight">
                    <Store class="inline-block mr-1" />
                    My Stores
                </h3>
                <p class="text-muted-foreground text-sm">As a manager, you can view and manage all your stores
                    below.</p>
            </div>
        </div> -->

        <div v-if="isMyStoresLoading">
            <div class="flex justify-center items-center h-screen">
                <Loader2 class="w-20 h-20 animate-spin" />
            </div>
        </div>

        <div class="mb-4 bg-destructive text-destructive-foreground rounded-md p-2 text-sm"
             v-if="!isMyStoresLoading && !isAbleToPlayAudio">
            To enable audio notifications, please click the button
            <br>
            or enable the audio permission in your browser settings.
            <br>
            <Button class="mt-2"
                    variant="outline"
                    @click="playBlankAudioLoop()">
                <Play class="inline-block mr-1" />
                Enable audio notifications
            </Button>
        </div>

        <div class="mb-4 bg-destructive text-destructive-foreground rounded-md p-4 font-bold"
             v-if="myStores.length === 0 && !isMyStoresLoading">
            You are not a order manager for any stores.
            <br>
            To manage orders for your stores, please contact your support or
            administrator.
            <br>
            <Button class=""
                    variant="outline"
                    @click="reload()">
                Refresh this page once you are a manager
            </Button>
        </div>

        <div class="mb-4 bg-destructive text-destructive-foreground rounded-md p-4 font-bold"
             v-if="myStores.length > 0 && !hasConnectionError && storeEventSources.size === 0 && !isMyStoresLoading">
            There is no store enabled.
            <br>
            Please open the settings and enable a store to receive orders in real time.
            <br>
            <Button @click="isSettingsDialogOpen = true;"
                    variant="outline">
                <Settings2 class="inline-block mr-1" />
                Settings
            </Button>
        </div>
        <div class="mb-4 bg-destructive text-destructive-foreground rounded-md p-4 font-bold"
             v-if="myStores.length > 0 && hasConnectionError && storeEventSources.size === 0 && !isMyStoresLoading">
            Connection error, will try to reconnect in 30 seconds.
        </div>
        <div class="mb-4 border border-bg-foreground rounded-md p-4 font-bold"
             v-else>
            <AlertCircle class="mr-2 inline-block" />
            Keep open this tab to receive new orders in real time.
        </div>

        <Dialog v-model:open="isSettingsDialogOpen">
            <DialogTrigger>
                <Button variant="outline">
                    <Settings2 class="inline-block mr-1" />
                    Settings
                </Button>
            </DialogTrigger>
            <DialogScrollContent class="w-full max-w-7xl">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription />
                </DialogHeader>

                <SettingsView />

                <DialogFooter>
                    <DialogClose as-child>
                        <Button variant="secondary"
                                class="w-full">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogScrollContent>
        </Dialog>


        <div class="">
            <div v-for="order in orders"
                 :key="order.orderId"
                 class="block">
                <Popover>
                    <PopoverTrigger as-child>
                        <Eye class="inline-block mr-1" />
                    </PopoverTrigger>
                    <PopoverContent class="max-w-xl w-full max-h-96 overflow-y-auto">
                        <pre>{{ order }}</pre>
                    </PopoverContent>
                </Popover>
                {{ order.orderId }}
                {{ formatDate(order.created_at_ts) }}
            </div>
        </div>
    </HeaderOnly>
</template>
