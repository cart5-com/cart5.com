<script setup lang="ts">
import { userDataStore } from "../../stores/UserData.store";
import CartView from "./CartView.vue";
import UserMenu from "../user/UserMenu.vue";
import StorePageAddressWidget from "../store-page/StorePageAddressWidget.vue";
import { Button } from "@/components/ui/button";
import type { OrderType } from "@lib/types/orderType";
import UserAddressForm from "../user/UserAddressForm.vue";
// import { type AddressType } from "@lib/zod/userAddressSchema";
import { onMounted } from "vue";
// import { geocode } from "@/ui-plus/geolocation-selection-map/geocode";
const orderType = window.orderType;

const createPageUrl = (orderType: OrderType) => {
    const url = new URL(window.location.href);
    if (orderType) url.searchParams.set("order-type", orderType);
    return url.toString();
}

onMounted(async () => {
    setTimeout(async () => {
        // const result = await geocode(userDataStore.value.userData?.rememberLastAddress || '', userDataStore.value.userData?.rememberLastCountry || '')
        // console.log(result.data as google.maps.GeocoderResponse);
    }, 1000);
})

</script>

<template>
    <div>
        <div class="max-w-md mx-auto"
             v-if="!userDataStore.user">
            Please login or register before checking out
            <UserMenu />
        </div>
        <div v-else>
            <!-- <UserAddressesView /> -->
            <UserAddressForm @complete="(v) => {
                console.log('complete', v);
            }"
                             :address="{
                                country: userDataStore.userData?.rememberLastCountry || '',
                                address1: userDataStore.userData?.rememberLastAddress || '',
                                lat: userDataStore.userData?.rememberLastLat || 0,
                                lng: userDataStore.userData?.rememberLastLng || 0,
                            }"
                             :is-edit="true" />


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