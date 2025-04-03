<script setup lang="ts">
import { onMounted } from 'vue';
import UserCard from "@/ui-plus/UserCard.vue";
import { initializeUserStore, userStore, logoutAll } from "@web-astro/stores/User.store";
import { Button } from "@/components/ui/button";
import { getLoginUrl, getSettingsUrl, getSignupUrl } from "@lib/clientUtils/getAuthOrigin";

let loginUrl = "";
let registerUrl = "";
let settingsUrl = "";

onMounted(async () => {
    loginUrl = getLoginUrl(import.meta.env.PUBLIC_DOMAIN_NAME);
    registerUrl = getSignupUrl(import.meta.env.PUBLIC_DOMAIN_NAME);
    settingsUrl = getSettingsUrl(import.meta.env.PUBLIC_DOMAIN_NAME);
    await initializeUserStore();
});



</script>

<template>
    <div>
        <div v-if="userStore">
            <UserCard :user="userStore" />
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
            <Button class="w-full mt-1"
                    as="a"
                    size="lg"
                    :href="loginUrl"
                    variant="outline">
                Login
            </Button>
            <Button class="w-full mt-1"
                    as="a"
                    size="lg"
                    :href="registerUrl"
                    variant="secondary">
                Register
            </Button>
        </div>
    </div>
</template>