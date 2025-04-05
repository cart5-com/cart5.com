<!-- TODO: remove this -->
<!-- <script setup lang="ts">
import { Button } from "@/components/ui/button";
import { onMounted } from "vue";
import { initializeUserLocalStore, userLocalStore } from "@web-astro/stores/UserLocal.store";
import { USER_DEFAULT_VALUE } from "@lib/types/UserLocalStorageTypes";


const hasLocalData = () => {
    if (userLocalStore.value) {
        return ((userLocalStore.value.carts && Object.keys(userLocalStore.value.carts).length > 0) ||
            userLocalStore.value.lat ||
            userLocalStore.value.lng ||
            userLocalStore.value.country ||
            userLocalStore.value.address) ? true : false;
    }
    return false;
};

const clearLocalData = () => {
    userLocalStore.value = USER_DEFAULT_VALUE;
};

onMounted(() => {
    initializeUserLocalStore();
});
</script>

<template>
    <Button v-if="hasLocalData()"
            class="w-full m-1"
            variant="outline"
            @click="clearLocalData">
        Clear Anonymized Data
    </Button>
</template> -->