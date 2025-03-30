<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    // PopoverClose,
    // PopoverDescription,
    // PopoverFooter,
    PopoverTrigger,
} from '@/components/ui/popover'
import AddressForm from '../AddressForm.vue';
import { onMounted } from 'vue';
import { initializeUserStore, userStore } from "@web-astro/stores/User.store";
import { MapPin } from 'lucide-vue-next';
import { ref } from 'vue';

const isOpen = ref(false);
onMounted(() => {
    initializeUserStore();
})

const onMapConfirm = (_result: { lat: number, lng: number }) => {
    isOpen.value = false;
    // console.log('onMapConfirm', result);
}
</script>

<template>
    <Popover v-model:open="isOpen">
        <PopoverTrigger as-child>
            <Button variant="outline"
                    class="max-w-[200px]">
                <span class="truncate">
                    <MapPin class="mr-1 inline-block" />
                    {{ userStore?.address || 'Location' }}
                </span>
            </Button>
        </PopoverTrigger>
        <PopoverContent align="start">
            <AddressForm button-label="Update"
                         @done="onMapConfirm" />
        </PopoverContent>
    </Popover>
</template>