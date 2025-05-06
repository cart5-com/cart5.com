<script lang="ts" setup>
import { AlertCircle, Eye, Loader2, Play, Settings2, CheckCircle, XCircle, Printer } from "lucide-vue-next";
import { myStores, isMyStoresLoading } from '@orders-spa-vue/stores/MyStoresStore'
import HeaderOnly from '@orders-spa-vue/layouts/HeaderOnly.vue';
import { Button } from "@/components/ui/button";
import { storeEventSources, hasConnectionError } from "@orders-spa-vue/utils/listenStoreNotifier";
import { computed, onMounted, ref } from "vue";
import { playBlankAudioLoop, isAbleToPlayAudio, watchNewOrders } from "@orders-spa-vue/utils/playAudio";
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
import { ORDER_STATUS_OBJ } from "@lib/types/orderStatus";
import { ordersApiClient } from "@api-client/orders";
import { toast } from "@/ui-plus/sonner";
import ShowOrderView from "@orders-spa-vue/components/ShowOrderView.vue";
import { printOrder } from "@orders-spa-vue/utils/printOrder";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const reload = () => {
    window.location.reload();
}

onMounted(() => {
    playBlankAudioLoop();
    watchNewOrders();
});

const orders = computed(() => {
    return Object.values(cachedStoreOrders.value).sort((a, b) => b.created_at_ts - a.created_at_ts);
});

const isSettingsDialogOpen = ref(false);

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
        if (data === 1) {
            cachedStoreOrders.value[orderId].orderStatus = ORDER_STATUS_OBJ.ACCEPTED;
        }
    }
}

const handleCancel = async (orderId: string, storeId: string) => {
    if (!confirm(`
🚨This action cannot be undone🚨
🚨Your store still will be charged for the service fees🚨
🚨if order has online payment, it will be refunded to customer🚨

Are you sure you want to cancel this order?`)) {
        return;
    }

    // Implement cancel logic
    const { data, error } = await (await ordersApiClient[":storeId"].cancel_order.$post({
        param: { storeId },
        json: { orderId }
    })).json();
    if (error) {
        toast.error(error.message ?? "Error cancelling order");
    } else {
        if (data === 1) {
            cachedStoreOrders.value[orderId].orderStatus = ORDER_STATUS_OBJ.CANCELLED;
        }
    }
}

const IS_DEV = import.meta.env.DEV;
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
                                    <Badge
                                           :variant="`${order.orderStatus === ORDER_STATUS_OBJ.CANCELLED ? 'destructive' : 'outline'}`">
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
                                <div class="flex gap-2"
                                     v-if="order.orderStatus === ORDER_STATUS_OBJ.CREATED">
                                    <Button size="sm"
                                            @click="handleAccept(order.orderId, order.storeId)">
                                        <CheckCircle class="h-4 w-4 mr-1" />
                                        Accept
                                    </Button>
                                </div>


                                <Dialog>
                                    <DialogTrigger>
                                        <Button variant="outline"
                                                size="sm">
                                            Show
                                        </Button>
                                    </DialogTrigger>
                                    <DialogScrollContent class="w-fit">
                                        <DialogHeader>
                                            <DialogTitle></DialogTitle>
                                            <DialogDescription />
                                            <div class="flex gap-2 justify-between">
                                                <Button class="w-full text-xl font-bold"
                                                        v-if="order.orderStatus === ORDER_STATUS_OBJ.CREATED"
                                                        @click="handleAccept(order.orderId, order.storeId)">
                                                    <CheckCircle class="h-4 w-4 mr-1" />
                                                    Accept
                                                </Button>
                                            </div>
                                            <Button variant="secondary"
                                                    class="w-full text-xl font-bold"
                                                    @click="printOrder(order)">
                                                <Printer class="mr-1" />
                                                Print
                                            </Button>
                                        </DialogHeader>

                                        <ShowOrderView :orderDetails="order" />

                                        <div class="flex gap-2 justify-between">
                                            <Button class="w-full"
                                                    v-if="order.orderStatus === ORDER_STATUS_OBJ.CREATED"
                                                    @click="handleAccept(order.orderId, order.storeId)">
                                                <CheckCircle class="h-4 w-4 mr-1" />
                                                Accept
                                            </Button>
                                            <DropdownMenu v-if="order.orderStatus !== ORDER_STATUS_OBJ.CANCELLED">
                                                <DropdownMenuTrigger as-child>
                                                    <Button variant="destructive"
                                                            size="sm">
                                                        <XCircle /> Cancel Order
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start">
                                                    <DropdownMenuItem @click="handleCancel(order.orderId, order.storeId)"
                                                                      class="bg-destructive text-destructive-foreground">
                                                        Are you sure?
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                    </DialogScrollContent>
                                </Dialog>

                                <Popover v-if="IS_DEV">
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
