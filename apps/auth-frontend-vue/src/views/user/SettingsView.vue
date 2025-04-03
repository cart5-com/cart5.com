<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card";
import UserSecuritySettings from "@auth-frontend-vue/components/forms/UserSecuritySettings.vue";
import Separator from "@/ui-plus/separator/Separator.vue";
import GoBackButton from "@auth-frontend-vue/components/GoBackButton.vue";
import LogoutButton from "@auth-frontend-vue/components/LogoutButton.vue";
import { userStore } from '@auth-frontend-vue/stores/User.store';
import UserCard from "@/ui-plus/UserCard.vue";

</script>

<template>
    <Card>
        <CardContent class="space-y-6">
            <GoBackButton />
            <h1 class="my-6 text-2xl font-bold">{{ $t('settings') }}</h1>
            <UserCard v-if="userStore"
                      :name="userStore?.name"
                      :email="userStore?.email"
                      :pictureUrl="userStore?.pictureUrl" />
            <LogoutButton />
            <Separator class="my-10" />
            <UserSecuritySettings class="my-10" />
        </CardContent>
    </Card>
</template>
