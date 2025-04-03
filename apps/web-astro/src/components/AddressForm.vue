<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GeolocationMap from "ui-shadcn-vue/src/ui-plus/geolocation-selection-map/GeolocationMap.vue";
import CountrySelect from "ui-shadcn-vue/src/ui-plus/CountrySelect.vue";
import { ipwhois } from "@/ui-plus/geolocation-selection-map/ipwhois";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ref, onMounted } from "vue";
import { DoorOpen, ChevronRight } from 'lucide-vue-next';
import { initializeUserLocalStore, userLocalStore } from "@web-astro/stores/UserLocal.store";
import { loadLeafletCDN } from "@/ui-plus/geolocation-selection-map/loadLeafletCDN";

defineProps<{
    buttonLabel?: string;
}>();

const isDialogOpen = ref(false);
onMounted(async () => {
    initializeUserLocalStore();
    if (!userLocalStore.value?.country) {
        const ipwho = await ipwhois()
        if (userLocalStore && userLocalStore.value && ipwho.country_code) {
            userLocalStore.value.country = ipwho.country_code
        }
    }
    setTimeout(() => {
        loadLeafletCDN(true);
    }, 1000);
});

const onSubmit = () => {
    isDialogOpen.value = true;
}

</script>

<template>
    <div v-if="userLocalStore">
        <Dialog v-model:open="isDialogOpen">
            <DialogContent
                           class="flex h-full min-h-full min-w-full flex-col p-0 sm:p-2 md:h-[70vh] md:min-h-[70vh] md:min-w-[80vw] lg:min-w-[50vw]">
                <DialogHeader>
                    <DialogTitle class="flex items-center gap-2">
                        <DoorOpen />
                        Confirm your entrance/door location
                    </DialogTitle>
                </DialogHeader>
                <GeolocationMap :address="userLocalStore.address!"
                                :country="userLocalStore.country!"
                                :lat="userLocalStore.lat!"
                                :lng="userLocalStore.lng!"
                                @done="$emit('done', $event)"
                                btn-label="Confirm" />
            </DialogContent>
        </Dialog>

        <form @submit.prevent="onSubmit">
            <div class="my-8 flex w-full items-center gap-1.5">
                <CountrySelect v-model="userLocalStore.country!"
                               class="h-10" />
                <Input v-model="userLocalStore.address!"
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