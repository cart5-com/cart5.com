<script setup lang="ts">
import { currentOrderType, userDataStore } from "../../stores/UserData.store";
import UserMenu from "../user/UserMenu.vue";
import UserAddressesView from "../user/UserAddressesView.vue";
import OrderTypeWidget from "../OrderTypeWidget.vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BASE_LINKS } from "@web-astro/utils/links";
import { slugify } from "@lib/utils/slugify";
import { Button } from "@/components/ui/button";

const selectAddress = () => {
    window.location.href = BASE_LINKS.CHECKOUT(window.storeData?.id!, slugify(window.storeData?.name!));
}
</script>

<template>
    <div class="max-w-lg mx-auto">
        <div v-if="!userDataStore.user">
            Please login or register before checking out
            <UserMenu />
        </div>
        <div v-else>
            Please confirm your information
            <OrderTypeWidget />
            <div class="max-w-2xl mx-auto my-4">
                <div v-if="currentOrderType === 'delivery'">
                    <UserAddressesView @selectAddress="selectAddress" />
                </div>
                <div v-if="currentOrderType === 'pickup' && userDataStore.userData">
                    <div class="grid gap-3 my-10">
                        <Label for="nickname-input">Your Pickup Name/Nickname</Label>
                        <Input id="nickname-input"
                               @keydown.enter="selectAddress"
                               placeholder="Enter a name/nickname for your pickup"
                               v-model="userDataStore.userData.rememberLastNickname!" />
                    </div>
                </div>
            </div>
            <div class="relative sticky bottom-0 z-40 max-w-full flex justify-between items-center ">
                <Button variant="default"
                        :disabled="!userDataStore.userData?.rememberLastAddressId"
                        @click="selectAddress"
                        class="w-full">
                    Confirm
                </Button>
            </div>
        </div>
    </div>
</template>