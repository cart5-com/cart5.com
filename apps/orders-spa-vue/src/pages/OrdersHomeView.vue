<script lang="ts" setup>
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Store } from "lucide-vue-next";
import { myStoresFiltered, myStores, searchQuery, isMyStoresLoading } from '@orders-spa-vue/stores/MyStoresStore'
import HeaderOnly from '@orders-spa-vue/layouts/HeaderOnly.vue';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { addListeningStore, MySettingsStore, removeListeningStore } from "@orders-spa-vue/stores/MySettingsStore";
import { storeEventSources, hasConnectionError } from "@orders-spa-vue/utils/listenStoreNotifier";

const IS_DEV = import.meta.env.DEV;

const reload = () => {
    window.location.reload();
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
            You are not listening to any stores.
            <br>
            Please enable below to start getting new orders.
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
        <div class="mb-4"
             v-if="myStores.length > 9 || IS_DEV">
            <Input v-model="searchQuery"
                   placeholder="Search by name or address"
                   class="max-w-sm" />
        </div>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
            <div v-for="store in myStoresFiltered"
                 :key="store.id"
                 class="block">
                <Card class="hover:bg-card/70 transition-colors">
                    <CardHeader>
                        <CardTitle class="text-lg">
                            <Store class="inline-block mr-1" />
                            {{ store.name }}
                        </CardTitle>
                        <CardDescription>{{ store.address1 }}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <div class="flex items-center gap-2">
                            <Label for="store-{{ store.id }}">
                                {{ MySettingsStore[store.id]?.isEnabled ? 'Enabled' : 'Disabled' }}
                            </Label>
                            <Switch id="store-{{ store.id }}"
                                    :checked="MySettingsStore[store.id]?.isEnabled"
                                    @update:checked="($event) => {
                                        if ($event) {
                                            addListeningStore(store.id);
                                        } else {
                                            removeListeningStore(store.id);
                                        }
                                    }" />
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </HeaderOnly>
</template>
