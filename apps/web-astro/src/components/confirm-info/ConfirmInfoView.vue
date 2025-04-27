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
import { ChevronLeft } from "lucide-vue-next";

const selectAddress = () => {
    window.location.href = BASE_LINKS.CHECKOUT(window.storeData?.id!, slugify(window.storeData?.name!));
}
const storeId = window.storeData?.id;
const storeName = window.storeData?.name;
</script>

<template>
    <div class="max-w-lg mx-auto">
        <div v-if="!userDataStore.user">
            <Button variant="outline"
                    as="a"
                    :href="BASE_LINKS.STORE(storeId!, slugify(storeName!), currentOrderType)"
                    class="">
                <ChevronLeft class="inline-block mr-2" />
                Back to store
            </Button>
            <div class="mt-8">
                Please login or register before checking out
            </div>
            <UserMenu />
        </div>
        <div v-else>
            <div class="flex justify-between items-center">
                <Button variant="outline"
                        as="a"
                        :href="BASE_LINKS.STORE(storeId!, slugify(storeName!), currentOrderType)"
                        class="w-full mr-4">
                    <ChevronLeft class="inline-block mr-2" />
                    Back to store
                </Button>
                <OrderTypeWidget />
            </div>

            <div class="mt-8">
                Please confirm your information
            </div>
            <div class="max-w-2xl mx-auto my-4">
                <div v-if="currentOrderType === 'delivery'">
                    <UserAddressesView @selectAddress="selectAddress" />
                </div>
                <div v-if="currentOrderType === 'pickup' && userDataStore.userData">
                    <div class="grid gap-3 my-10 bg-card text-card-foreground p-4 rounded-lg">
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