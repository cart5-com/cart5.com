<script setup lang="ts">
import AddressForm from "./AddressForm.vue";
import { onMounted } from "vue";
import { initializeUserStore, userStore } from "@web-astro/stores/User.store";
import { BASE_LINKS } from "@web-astro/utils/links";

onMounted(async () => {
    initializeUserStore();
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

const onMapConfirm = (result: { lat: number, lng: number }) => {
    console.log('onMapConfirm', result);
    userStore.value!.lat = result.lat;
    userStore.value!.lng = result.lng;
    redirectToList();
}

</script>

<template>
    <div v-if="userStore">
        <AddressForm @done="onMapConfirm" />
    </div>
</template>