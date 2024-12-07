<script setup lang="ts">
import AuthTabs from "./AuthTabs.vue";
import { authApiClient } from "./authApiClient";
import { userStore } from './userStore';
import DialogProvider from "@/ui-plus/dialog/DialogProvider.vue";
import { useDialog } from "@/ui-plus/dialog/use-dialog";
const { showBlockingLoadingModal, cancel } = useDialog()

const whoAmI = async () => {
    const loadingId = showBlockingLoadingModal();
    const { data, error } = await (await authApiClient.api.user.whoami.$post()).json();
    if (error) {
        console.error(error);
        alert("Error fetching user data");
    } else {
        userStore.setUser(data ?? null);
    }
    // await new Promise(resolve => setTimeout(resolve, 500));
    cancel(loadingId)
};
whoAmI();
</script>
<template>
    <div v-if="userStore.user">
        Welcome, {{ userStore.user.email }}
    </div>
    <div v-else>
        <AuthTabs />
    </div>
    <DialogProvider />
</template>