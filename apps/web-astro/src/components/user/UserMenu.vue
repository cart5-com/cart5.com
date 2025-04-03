<script setup lang="ts">
import { onMounted, ref } from 'vue';
import UserCard from "@/ui-plus/UserCard.vue";
import { apiClient } from "@api-client/index";

const userStore = ref<{
    name: string;
    email: string;
    pictureUrl: string;
} | null>(null);

onMounted(async () => {
    const { data, error } = await (await apiClient.auth_global.whoami.$post()).json();
    console.log(data, error);
    userStore.value = data;
})
</script>

<template>
    <div>
        <UserCard v-if="userStore"
                  :name="userStore?.name"
                  :email="userStore?.email"
                  :pictureUrl="userStore?.pictureUrl" />
    </div>
</template>