<script lang="ts" setup>
import { AlertCircle, Eye, Loader2, Play, Settings2, CheckCircle, XCircle, ExternalLink } from "lucide-vue-next";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SettingsView from "./SettingsView.vue";
import { OrderStatus } from "@lib/types/orderStatus";
import { ordersApiClient } from "@api-client/orders";
import { toast } from "@/ui-plus/sonner";

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

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'CREATED':
            return 'bg-blue-500';
        case 'PREPARING':
            return 'bg-green-700';
        case 'CANCELLED':
            return 'bg-red-500';
        default:
            return 'bg-gray-500';
    }
}

const handleAccept = async (orderId: string, storeId: string) => {
    console.log('Accept order', orderId);
    // Implement accept logic
    const { data, error } = await (await ordersApiClient[":storeId"].accept_order.$post({
        param: { storeId },
        json: { orderId }
    })).json();
    if (error) {
        toast.error(error.message ?? "Error accepting order");
    } else {
        console.log(data)
        console.log('Accept order', data);
    }
}

const handleReject = (orderId: string, storeId: string) => {
    console.log('Reject order', orderId, storeId);
    // Implement reject logic
}

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

        <div class="space-y-4">
            <div v-for="order in orders"
                 :key="order.orderId"
                 class="block">
                <Card>
                    <CardContent class="p-4">
                        <div class="flex flex-col md:flex-row justify-between gap-4">
                            <!-- Order Info -->
                            <div class="space-y-2 flex-grow">
                                <div class="flex flex-wrap items-center gap-2">
                                    <h3 class="text-lg font-bold">#{{ order.shortOtp || 'N/A' }}</h3>
                                    <Badge :class="getStatusColor(order.orderStatus)">
                                        {{ order.orderStatus }}
                                    </Badge>
                                    <Badge variant="outline"
                                           class="capitalize">
                                        {{ order.orderType || 'N/A' }}
                                    </Badge>
                                </div>
                                <div>
                                    <p class="text-sm font-medium">
                                        {{
                                            order.deliveryAddressJSON?.nickname ||
                                            order.pickupNickname ||
                                            order.userEmail || 'unknown'
                                        }}
                                    </p>
                                    <p class="text-xs text-muted-foreground">{{ formatDate(order.created_at_ts) }}</p>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div class="flex flex-wrap gap-2 items-center">
                                <div v-if="order.orderStatus === 'CREATED'"
                                     class="flex gap-2">
                                    <Button size="sm"
                                            @click="handleAccept(order.orderId, order.storeId)">
                                        <CheckCircle class="h-4 w-4 mr-1" />
                                        Accept
                                    </Button>
                                    <Button variant="destructive"
                                            size="sm"
                                            @click="handleReject(order.orderId, order.storeId)">
                                        <XCircle class="h-4 w-4 mr-1" />
                                        Reject
                                    </Button>
                                </div>

                                <Button variant="outline"
                                        size="sm">
                                    <ExternalLink class="h-4 w-4 mr-1" />
                                    Details
                                </Button>

                                <Popover>
                                    <PopoverTrigger as-child>
                                        <Button variant="ghost"
                                                size="sm">
                                            <Eye class="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent class="max-w-xl w-full max-h-96 overflow-y-auto">
                                        <pre class="text-xs">{{ order }}</pre>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </HeaderOnly>
</template>
