<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GeolocationMap from "ui-shadcn-vue/src/ui-plus/geolocation-selection-map/GeolocationMap.vue";
import CountrySelect from "ui-shadcn-vue/src/ui-plus/CountrySelect.vue";
import { userDataStore, loadCountryFromIp } from "@web-astro/stores/UserData.store";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ref, onMounted } from "vue";
import { DoorOpen, ChevronRight } from 'lucide-vue-next';
import { loadLeafletCDN } from "@/ui-plus/geolocation-selection-map/loadLeafletCDN";

defineProps<{
    buttonLabel?: string;
}>();

const isDialogOpen = ref(false);
onMounted(async () => {
    loadCountryFromIp();
    setTimeout(() => {
        loadLeafletCDN(true);
    }, 1000);
});

const onSubmit = () => {
    isDialogOpen.value = true;
}

</script>

<template>
    <div v-if="userDataStore.userData">
        <Dialog v-model:open="isDialogOpen">
            <DialogContent
                           class="flex h-full min-h-full min-w-full flex-col p-0 sm:p-2 md:h-[70vh] md:min-h-[70vh] md:min-w-[80vw] lg:min-w-[50vw]">
                <DialogHeader>
                    <DialogTitle class="flex items-center gap-2">
                        <DoorOpen />
                        Confirm your entrance/door location
                    </DialogTitle>
                </DialogHeader>
                <GeolocationMap :address="userDataStore.userData.rememberLastAddress!"
                                :country="userDataStore.userData.rememberLastCountry!"
                                :lat="userDataStore.userData.rememberLastLat!"
                                :lng="userDataStore.userData.rememberLastLng!"
                                @done="$emit('done', $event)"
                                btn-label="Confirm" />
            </DialogContent>
        </Dialog>

        <form @submit.prevent="onSubmit">
            <div class="my-8 flex w-full items-center gap-1.5">
                <CountrySelect v-model="userDataStore.userData.rememberLastCountry!"
                               class="h-10" />
                <Input v-model="userDataStore.userData.rememberLastAddress!"
                       autocomplete="street-address"
                       class="inline-block"
                       type="text"
                       placeholder="Enter your address" />
            </div>
            <Button @click="onSubmit"
                    size="lg"
                    class="w-full mt-4 font-bold">{{ buttonLabel || 'Order now' }}
                <ChevronRight />
            </Button>
        </form>
    </div>
</template>