<script setup lang="ts">
import { onMounted, ref } from 'vue';
import UserCard from "@/ui-plus/UserCard.vue";
import { Button } from "@/components/ui/button";
import { getLoginUrl, getSettingsUrl, getSignupUrl } from "@lib/clientUtils/getAuthOrigin";
import { userDataStore, logoutAll } from "@web-astro/stores/UserData.store";

const isLoading = ref(true);
let loginUrl = "";
let registerUrl = "";
let settingsUrl = "";

onMounted(async () => {
    loginUrl = getLoginUrl(import.meta.env.PUBLIC_DOMAIN_NAME);
    registerUrl = getSignupUrl(import.meta.env.PUBLIC_DOMAIN_NAME);
    settingsUrl = getSettingsUrl(import.meta.env.PUBLIC_DOMAIN_NAME);
    isLoading.value = false;
});

</script>

<template>
    <div v-if="!isLoading"
         class="p-2">
        <div v-if="userDataStore?.user">
            <UserCard :user="userDataStore.user" />
            <Button class="w-full mt-1"
                    as="a"
                    size="lg"
                    :href="settingsUrl"
                    variant="outline">
                Security
            </Button>
            <Button class="w-full mt-1 cursor-pointer"
                    size="lg"
                    variant="outline"
                    @click="logoutAll">
                Logout
            </Button>
        </div>
        <div v-else>
            <Button class="w-full mt-4"
                    as="a"
                    size="lg"
                    :href="loginUrl"
                    variant="outline">
                Login
            </Button>
            <Button class="w-full mt-4"
                    as="a"
                    size="lg"
                    :href="registerUrl"
                    variant="secondary">
                Register
            </Button>
        </div>
    </div>
</template>