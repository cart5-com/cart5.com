<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GeolocationMap from "ui-shadcn-vue/src/ui-plus/geolocation-selection-map/GeolocationMap.vue";
import CountrySelect from "ui-shadcn-vue/src/ui-plus/CountrySelect.vue";
import type { GeoLocation } from "ui-shadcn-vue/src/ui-plus/geolocation-selection-map/types";
import { ipwhois } from "@/ui-plus/geolocation-selection-map/ipwhois";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ref, onMounted, watch } from "vue";
import { loadLeafletCDN } from '@/ui-plus/geolocation-selection-map/loadLeafletCDN';
import { Loader2, DoorOpen, ChevronRight } from 'lucide-vue-next';
import { BASE_LINKS } from "@web-astro/utils/links";
import { initializeUserStore, userStore } from "@web-astro/stores/User.store";
const address = ref<string | null>(null);
const country = ref<string | null>(null);
const isDialogOpen = ref(false);
const mapLocation = ref<GeoLocation | null>(null);
const isLoading = ref(false);

// Watch for changes in address and country, save to localStorage
watch(address, (newValue) => {
    localStorage.setItem('REMEMBER_LAST_ADDRESS', newValue || '');
});

watch(country, (newValue) => {
    localStorage.setItem('REMEMBER_LAST_COUNTRY', newValue || '');
});

onMounted(async () => {
    isLoading.value = true;
    initializeUserStore();

    mapLocation.value = JSON.parse(localStorage.getItem('REMEMBER_LAST_LOCATION') || '{}') as GeoLocation;
    if (
        (window.location.pathname + window.location.search) !== BASE_LINKS.HOME_UPDATE_ADDRESS &&
        mapLocation.value?.lat &&
        mapLocation.value?.lng &&
        mapLocation.value?.address &&
        mapLocation.value?.country
    ) {
        redirectToStores();
    }

    // Load saved values from localStorage if they exist
    const savedAddress = localStorage.getItem('REMEMBER_LAST_ADDRESS');
    const savedCountry = localStorage.getItem('REMEMBER_LAST_COUNTRY');

    if (savedAddress) address.value = savedAddress;
    if (savedCountry) country.value = savedCountry;

    // If no saved country, get from IP geolocation
    if (!country.value) {
        const ipwho = await ipwhois()
        country.value = ipwho.country_code || null
    }

    setTimeout(() => {
        loadLeafletCDN(true);
    }, 1000);

    isLoading.value = false;
});

const onSubmit = () => {
    isDialogOpen.value = true;
    if (!mapLocation.value) {
        mapLocation.value = JSON.parse(localStorage.getItem('REMEMBER_LAST_LOCATION') || '{}') as GeoLocation;
    }
    mapLocation.value.address = address.value || '';
    mapLocation.value.country = country.value || '';
}

const redirectToStores = () => {
    const url = new URL(window.location.href);
    url.pathname = BASE_LINKS.LIST_STORES;
    url.searchParams.set('lat', mapLocation.value?.lat?.toString() || '0');
    url.searchParams.set('lng', mapLocation.value?.lng?.toString() || '0');
    url.searchParams.set('address', mapLocation.value?.address || address.value || '');
    url.searchParams.set('country', mapLocation.value?.country || country.value || '');
    if (
        mapLocation.value?.country === "US" ||
        mapLocation.value?.country === "LR" ||
        mapLocation.value?.country === "MM"
    ) {
        url.searchParams.set('measure', 'mi');
    }

    window.location.href = url.toString();
}

const onMapConfirm = async () => {
    isDialogOpen.value = false;
    localStorage.setItem('REMEMBER_LAST_LOCATION', JSON.stringify({
        lat: mapLocation.value?.lat || 0,
        lng: mapLocation.value?.lng || 0,
        address: mapLocation.value?.address || address.value || '',
        country: mapLocation.value?.country || country.value || '',
    } as GeoLocation));

    redirectToStores();
}

</script>

<template>
    <div>
        <Dialog v-model:open="isDialogOpen">
            <DialogContent
                           class="flex h-full min-h-full min-w-full flex-col p-0 sm:p-2 md:h-[70vh] md:min-h-[70vh] md:min-w-[80vw] lg:min-w-[50vw]">
                <DialogHeader>
                    <DialogTitle class="flex items-center gap-2">
                        <DoorOpen />
                        Confirm your entrance/door location
                    </DialogTitle>
                </DialogHeader>
                <GeolocationMap v-model="mapLocation!"
                                class="flex-1 overflow-hidden" />
                <DialogFooter>
                    <Button type="button"
                            @click="onMapConfirm"
                            :disabled="isLoading"
                            class="w-full my-6">
                        <Loader2 v-if="isLoading"
                                 class="animate-spin" />
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <form @submit.prevent="onSubmit">
            <div class="my-8 flex w-full items-center gap-1.5">
                <CountrySelect v-model="country"
                               class="h-10" />
                <Input v-model="address!"
                       autocomplete="street-address"
                       class="inline-block"
                       type="text"
                       placeholder="Enter your address" />
            </div>
            <Button @click="onSubmit"
                    size="lg"
                    :disabled="isLoading"
                    class="w-full mt-4 font-bold">Order now
                <Loader2 v-if="isLoading"
                         class="animate-spin" />
                <ChevronRight />
            </Button>
        </form>
    </div>
</template>