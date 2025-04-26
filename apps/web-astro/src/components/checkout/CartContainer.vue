<script setup lang="ts">
import { userDataStore } from "../../stores/UserData.store";
import CartView from "./CartView.vue";
import UserMenu from "../user/UserMenu.vue";
import StorePageAddressWidget from "../store-page/StorePageAddressWidget.vue";
import { Button } from "@/components/ui/button";
import type { OrderType } from "@lib/types/orderType";
import UserAddressesView from "../user/UserAddressesView.vue";
import { onMounted } from "vue";
import { showPhoneValidationForm } from "@/ui-plus/PhoneNumber/validation/PhoneValidation";
import { getTurnstileUrl } from "@lib/clientUtils/getAuthOrigin";

const orderType = window.orderType;
const createPageUrl = (orderType: OrderType) => {
    const url = new URL(window.location.href);
    if (orderType) url.searchParams.set("order-type", orderType);
    return url.toString();
}

onMounted(async () => {
    setTimeout(async () => {
        if (userDataStore.value.user?.hasVerifiedPhoneNumber === 0) {
            showPhoneValidationForm(getTurnstileUrl(import.meta.env.PUBLIC_DOMAIN_NAME))
        }
    }, 1000);
})

const offersDelivery = window.storeData?.offersDelivery ?? false;
const offersPickup = window.storeData?.offersPickup ?? false;

</script>

<template>
    <div>
        <div class="max-w-md mx-auto"
             v-if="!userDataStore.user">
            Please login or register before checking out
            <UserMenu />
        </div>
        <div v-else>
            <div class="max-w-2xl mx-auto">
                <UserAddressesView />
            </div>

            <StorePageAddressWidget />

            <!-- // TODO: CHECK SUPPORTED ORDER TYPES VALIDATION HERE (delivery, pickup) -->
            <div
                 class="bg-muted text-muted-foreground my-4 grid w-fit grid-cols-2 items-center justify-center rounded-lg p-1">
                <Button variant="ghost"
                        as="a"
                        v-if="offersDelivery"
                        :class="orderType === 'delivery' ? 'bg-background text-foreground shadow hover:bg-background/80' : ''"
                        :href="createPageUrl('delivery')">
                    Delivery
                </Button>
                <Button variant="ghost"
                        as="a"
                        v-if="offersPickup"
                        :class="orderType === 'pickup' ? 'bg-background text-foreground shadow hover:bg-background/80' : ''"
                        :href="createPageUrl('pickup')">
                    Pickup
                </Button>
            </div>


            <CartView />
        </div>
    </div>
</template>