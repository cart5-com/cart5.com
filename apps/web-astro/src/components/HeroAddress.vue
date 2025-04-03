<script setup lang="ts">
import AddressForm from "./AddressForm.vue";
import { onMounted } from "vue";
import { initializeUserStore, userLocalStore } from "@web-astro/stores/UserLocal.store";
import { BASE_LINKS } from "@web-astro/utils/links";

onMounted(async () => {
    initializeUserStore();
    if (
        (window.location.pathname + window.location.search) !== BASE_LINKS.HOME_UPDATE_ADDRESS &&
        userLocalStore.value?.lat && userLocalStore.value?.lat !== 0 &&
        userLocalStore.value?.lng && userLocalStore.value?.lng !== 0 &&
        userLocalStore.value?.address &&
        userLocalStore.value?.country
    ) {
        redirectToList();
    }
});

const redirectToList = () => {
    const url = new URL(window.location.href);
    url.pathname = BASE_LINKS.LIST_STORES;
    url.searchParams.set('lat', userLocalStore.value?.lat?.toString() || '0');
    url.searchParams.set('lng', userLocalStore.value?.lng?.toString() || '0');
    url.searchParams.set('address', userLocalStore.value?.address || '');
    url.searchParams.set('country', userLocalStore.value?.country || '');
    if (
        userLocalStore.value?.country === "US" ||
        userLocalStore.value?.country === "LR" ||
        userLocalStore.value?.country === "MM"
    ) {
        url.searchParams.set('measure', 'mi');
    }

    window.location.href = url.toString();
}

const onMapConfirm = (result: { lat: number, lng: number }) => {
    console.log('onMapConfirm', result);
    userLocalStore.value!.lat = result.lat;
    userLocalStore.value!.lng = result.lng;
    redirectToList();
}

</script>

<template>
    <div v-if="userLocalStore">
        <AddressForm @done="onMapConfirm" />
    </div>
</template>