<script setup lang="ts">
import { useDialog } from '@/ui-plus/dialog/use-dialog';
import UserAddressForm from './UserAddressForm.vue';
import { userDataStore } from '@web-astro/stores/UserData.store';
import type { AddressType } from '@lib/zod/userAddressSchema';
import { Button } from '@/components/ui/button';
import { onMounted } from 'vue';

const dialog = useDialog();

function newAddress() {
    dialog.show<AddressType>({
        title: 'Add Address',
        component: UserAddressForm,
        props: {
            address: {
                country: userDataStore.value.userData?.rememberLastCountry || '',
                address1: userDataStore.value.userData?.rememberLastAddress || '',
                lat: userDataStore.value.userData?.rememberLastLat || 0,
                lng: userDataStore.value.userData?.rememberLastLng || 0,
            },
        },
        onSuccess: (address) => {
            if (!userDataStore.value.userData?.addresses) {
                userDataStore.value.userData!.addresses = {};
            }
            userDataStore.value.userData!.addresses![address.addressId] = address;
            userDataStore.value.userData!.rememberLastAddressId = address.addressId;
            userDataStore.value.userData!.rememberLastAddress = address.address1;
            userDataStore.value.userData!.rememberLastCountry = address.country;
            userDataStore.value.userData!.rememberLastLat = address.lat || null;
            userDataStore.value.userData!.rememberLastLng = address.lng || null;
        }
    })
}

onMounted(() => {
    setTimeout(() => {
        if (!userDataStore.value.userData?.addresses || Object.keys(userDataStore.value.userData?.addresses).length === 0) {
            newAddress();
        }
    }, 1000);
})
</script>

<template>
    <div>
        <Button variant="secondary"
                @click="newAddress"> Add Address </Button>
    </div>
</template>