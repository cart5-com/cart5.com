<script setup lang="ts">
import { userDataStore } from "../../stores/UserData.store";
import CartView from "./CartView.vue";
import UserMenu from "../user/UserMenu.vue";
import StorePageAddressWidget from "../store-page/StorePageAddressWidget.vue";
import { Button } from "@/components/ui/button";
import type { OrderType } from "@lib/types/orderType";
import UserAddressesView from "../user/UserAddressesView.vue";

const orderType = window.orderType;

const createPageUrl = (orderType: OrderType) => {
    const url = new URL(window.location.href);
    if (orderType) url.searchParams.set("order-type", orderType);
    return url.toString();
}
</script>

<template>
    <div>
        <div class="max-w-md mx-auto"
             v-if="!userDataStore.user">
            Please login or register before checking out
            <UserMenu />
        </div>
        <div v-else>
            <UserAddressesView />


            <StorePageAddressWidget />

            <div
                 class="bg-muted text-muted-foreground my-4 grid w-fit min-w-48 grid-cols-2 items-center justify-center rounded-lg p-1">
                <Button variant="ghost"
                        as="a"
                        :class="orderType === 'delivery' ? 'bg-background text-foreground shadow hover:bg-background/80' : ''"
                        :href="createPageUrl('delivery')">
                    Delivery
                </Button>
                <Button variant="ghost"
                        as="a"
                        :class="orderType === 'pickup' ? 'bg-background text-foreground shadow hover:bg-background/80' : ''"
                        :href="createPageUrl('pickup')">
                    Pickup
                </Button>
            </div>


            <CartView />
        </div>
    </div>
</template>