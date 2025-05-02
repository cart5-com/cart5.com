<script setup lang="ts">
// import AddressForm from "./AddressForm.vue";
import NewAddressForm from "./NewAddressForm.vue";
import { onMounted } from "vue";
import { BASE_LINKS } from "@web-astro/utils/links";

import { userDataStore, handleDataChangeNow, currentOrderType } from "@web-astro/stores/UserData.store";

onMounted(async () => {
    // initializeUserLocalStore();
    while (!userDataStore.value?.userData) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (
        (window.location.pathname + window.location.search) !== BASE_LINKS.HOME_UPDATE_ADDRESS &&
        userDataStore.value?.userData?.rememberLastLat && userDataStore.value?.userData?.rememberLastLat !== 0 &&
        userDataStore.value?.userData?.rememberLastLng && userDataStore.value?.userData?.rememberLastLng !== 0 &&
        userDataStore.value?.userData?.rememberLastAddress &&
        userDataStore.value?.userData?.rememberLastCountry
    ) {
        redirectToList();
    }
});

const redirectToList = () => {
    const url = new URL(window.location.href);
    url.pathname = BASE_LINKS.LIST_STORES;
    url.searchParams.set('lat', userDataStore.value?.userData?.rememberLastLat?.toString() || '0');
    url.searchParams.set('lng', userDataStore.value?.userData?.rememberLastLng?.toString() || '0');
    url.searchParams.set('address', userDataStore.value?.userData?.rememberLastAddress || '');
    url.searchParams.set('country', userDataStore.value?.userData?.rememberLastCountry || '');
    url.searchParams.set('order-type', currentOrderType.value || 'delivery');
    if (
        userDataStore.value?.userData?.rememberLastCountry?.toUpperCase() === "US" ||
        userDataStore.value?.userData?.rememberLastCountry?.toUpperCase() === "LR" ||
        userDataStore.value?.userData?.rememberLastCountry?.toUpperCase() === "MM"
    ) {
        url.searchParams.set('measure', 'mi');
    }

    window.location.href = url.toString();
}

const onMapConfirm = async (result: { lat: number, lng: number }) => {
    console.log('onMapConfirm', result);
    (userDataStore.value as any).ignoreAutoDebounceSave = true;
    userDataStore.value!.userData!.rememberLastLat = result.lat;
    userDataStore.value!.userData!.rememberLastLng = result.lng;
    await handleDataChangeNow(userDataStore.value);
    (userDataStore.value as any).ignoreAutoDebounceSave = false;
    redirectToList();
}

</script>

<template>
    <div v-if="userDataStore.userData">
        <NewAddressForm @done="onMapConfirm" />
    </div>
</template>