<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GeolocationMap2 from "ui-shadcn-vue/src/ui-plus/geolocation-selection-map/GeolocationMap2.vue";
import CountrySelect from "ui-shadcn-vue/src/ui-plus/CountrySelect.vue";
import { ipwhois } from "@/ui-plus/geolocation-selection-map/ipwhois";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ref, onMounted } from "vue";
import { DoorOpen, ChevronRight } from 'lucide-vue-next';
import { initializeUserStore, userStore } from "@web-astro/stores/User.store";
import { loadLeafletCDN } from "@/ui-plus/geolocation-selection-map/loadLeafletCDN";
import { BASE_LINKS } from "@web-astro/utils/links";

const isDialogOpen = ref(false);
onMounted(async () => {
    initializeUserStore();
    if (!userStore.value?.country) {
        const ipwho = await ipwhois()
        if (userStore && userStore.value && ipwho.country_code) {
            userStore.value.country = ipwho.country_code
        }
    }
    setTimeout(() => {
        loadLeafletCDN(true);
    }, 1000);
    if (
        (window.location.pathname + window.location.search) !== BASE_LINKS.HOME_UPDATE_ADDRESS &&
        userStore.value?.lat && userStore.value?.lat !== 0 &&
        userStore.value?.lng && userStore.value?.lng !== 0 &&
        userStore.value?.address &&
        userStore.value?.country
    ) {
        redirectToList();
    }
});

const redirectToList = () => {
    const url = new URL(window.location.href);
    url.pathname = BASE_LINKS.LIST_STORES;
    url.searchParams.set('lat', userStore.value?.lat?.toString() || '0');
    url.searchParams.set('lng', userStore.value?.lng?.toString() || '0');
    url.searchParams.set('address', userStore.value?.address || '');
    url.searchParams.set('country', userStore.value?.country || '');
    if (
        userStore.value?.country === "US" ||
        userStore.value?.country === "LR" ||
        userStore.value?.country === "MM"
    ) {
        url.searchParams.set('measure', 'mi');
    }

    window.location.href = url.toString();
}

const onSubmit = () => {
    isDialogOpen.value = true;
}

const onMapConfirm = (result: { lat: number, lng: number }) => {
    userStore.value!.lat = result.lat;
    userStore.value!.lng = result.lng;
    redirectToList();
}

</script>

<template>
    <div v-if="userStore">
        <Dialog v-model:open="isDialogOpen">
            <DialogContent
                           class="flex h-full min-h-full min-w-full flex-col p-0 sm:p-2 md:h-[70vh] md:min-h-[70vh] md:min-w-[80vw] lg:min-w-[50vw]">
                <DialogHeader>
                    <DialogTitle class="flex items-center gap-2">
                        <DoorOpen />
                        Confirm your entrance/door location
                    </DialogTitle>
                    <DialogDescription>
                        Please confirm the location of your entrance/door.
                    </DialogDescription>
                </DialogHeader>
                <GeolocationMap2 :address="userStore.address!"
                                 :country="userStore.country!"
                                 @done="onMapConfirm"
                                 btn-label="Confirm" />
            </DialogContent>
        </Dialog>

        <form @submit.prevent="onSubmit">
            <div class="my-8 flex w-full items-center gap-1.5">
                <CountrySelect v-model="userStore.country!"
                               class="h-10" />
                <Input v-model="userStore.address!"
                       autocomplete="street-address"
                       class="inline-block"
                       type="text"
                       placeholder="Enter your address" />
            </div>
            <Button @click="onSubmit"
                    size="lg"
                    class="w-full mt-4 font-bold">Order now
                <ChevronRight />
            </Button>
        </form>
    </div>
</template>