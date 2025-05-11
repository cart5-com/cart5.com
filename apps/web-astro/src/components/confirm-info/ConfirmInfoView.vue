<script setup lang="ts">
import { currentOrderType, isUserDataReady, userDataStore } from "../../stores/UserData.store";
import UserMenu from "../user/UserMenu.vue";
import UserAddressesView from "../user/UserAddressesView.vue";
import OrderTypeWidget from "../OrderTypeWidget.vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BASE_LINKS } from "@web-astro/utils/links";
import { slugify } from "@lib/utils/slugify";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-vue-next";

const selectAddress = () => {
    window.location.href = BASE_LINKS.CHECKOUT(window.storeData?.id!, slugify(window.storeData?.name!));
}
const storeId = window.storeData?.id;
const storeName = window.storeData?.name;
</script>

<template>
    <div class="max-w-lg mx-auto">
        <div v-if="!isUserDataReady">
            <Loader2 class="animate-spin w-20 h-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div v-else>
            <div v-if="!userDataStore.user">
                <Button variant="outline"
                        as="a"
                        :href="BASE_LINKS.STORE(storeId!, slugify(storeName!), currentOrderType)"
                        class="">
                    <ChevronLeft class="inline-block mr-2" />
                    Back to {{ storeName }}
                </Button>
                <div class="mt-8">
                    Please login or register before checking out
                </div>
                <UserMenu />
            </div>
            <div v-else>
                <div class="overflow-x-auto overflow-y-hidden whitespace-nowrap no-scrollbar">
                    <div class="flex justify-between items-center  sm:flex-row flex-col">
                        <Button variant="outline"
                                as="a"
                                :href="BASE_LINKS.STORE(storeId!, slugify(storeName!), currentOrderType)"
                                class="w-full mr-4">
                            <ChevronLeft class="inline-block mr-2" />
                            Back to {{ storeName }}
                        </Button>
                        <OrderTypeWidget />
                    </div>
                </div>

                <div class="mt-8">
                    Please confirm your information
                </div>
                <div class="max-w-2xl mx-auto my-4">
                    <div v-if="currentOrderType === 'delivery'">
                        <UserAddressesView @selectAddress="selectAddress" />
                        <div class="relative sticky bottom-0 z-40 max-w-full flex justify-between items-center mt-8 ">
                            <Button size="lg"
                                    :disabled="!userDataStore.userData?.rememberLastAddressId"
                                    @click="selectAddress"
                                    class="w-full text-lg font-bold">
                                Confirm
                                <ChevronRight class="inline-block ml-2" />
                            </Button>
                        </div>
                    </div>
                    <div v-if="currentOrderType === 'pickup' && userDataStore.userData">
                        <div class="grid gap-3 my-10 bg-card text-card-foreground p-4 rounded-lg">
                            <Label for="nickname-input">Your Pickup Name/Nickname</Label>
                            <Input id="nickname-input"
                                   @keydown.enter="selectAddress"
                                   placeholder="Enter a name/nickname for your pickup"
                                   v-model="userDataStore.userData.rememberLastNickname!" />
                        </div>
                        <div class="relative sticky bottom-0 z-40 max-w-full flex justify-between items-center mt-8 ">
                            <Button size="lg"
                                    :disabled="!userDataStore.userData.rememberLastNickname"
                                    @click="selectAddress"
                                    class="w-full text-lg font-bold">
                                Confirm
                                <ChevronRight class="inline-block ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>