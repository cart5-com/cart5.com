<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer'
// import AddressForm from '../AddressForm.vue';
import { userDataStore } from "@web-astro/stores/UserData.store";
import { MapPin } from 'lucide-vue-next';
import { ref } from 'vue';
import NewAddressForm from '@web-astro/components/NewAddressForm.vue';

const isOpen = ref(false);

const onMapConfirm = (_result: { lat: number, lng: number }) => {
    isOpen.value = false;
    // console.log('onMapConfirm', result);
    userDataStore.value.userData!.rememberLastLat = _result.lat;
    userDataStore.value.userData!.rememberLastLng = _result.lng;
}
</script>

<template>
    <Drawer v-model:open="isOpen">
        <DrawerTrigger as-child>
            <Button variant="outline"
                    class="max-w-[200px]">
                <span class="truncate">
                    <MapPin class="mr-1 inline-block" />
                    {{ userDataStore.userData?.rememberLastAddress || 'Location' }}
                </span>
            </Button>
        </DrawerTrigger>
        <!-- <DrawerContent align="start">
            <AddressForm button-label="Update"
                         @done="onMapConfirm" />
        </DrawerContent> -->

        <DrawerContent>
            <div class="mx-auto w-full max-w-sm py-20">
                <DrawerHeader>
                    <DrawerTitle>Update Address</DrawerTitle>
                    <!-- <DrawerDescription></DrawerDescription> -->
                </DrawerHeader>
                <div class="p-4 pb-0">
                    <!-- <AddressForm button-label="Update"
                                 @done="onMapConfirm" /> -->
                    <NewAddressForm button-label="Update"
                                    @done="onMapConfirm" />
                </div>
                <!-- <DrawerFooter>
                    <Button>Submit</Button>
                    <DrawerClose as-child>
                        <Button variant="outline">
                            Cancel
                        </Button>
                    </DrawerClose>
                </DrawerFooter> -->
            </div>
        </DrawerContent>
    </Drawer>
</template>