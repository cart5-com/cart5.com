<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card";
import UserDetails from "@auth-frontend-vue/components/forms/UserDetails.vue";
import UserSecuritySettings from "@auth-frontend-vue/components/forms/UserSecuritySettings.vue";
import Separator from "@/ui-plus/separator/Separator.vue";
import GoBackButton from "@auth-frontend-vue/components/GoBackButton.vue";
import LogoutButton from "@auth-frontend-vue/components/LogoutButton.vue";
</script>

<template>
    <Card>
        <CardContent class="space-y-6">
            <GoBackButton />
            <h1 class="my-6 text-2xl font-bold">{{ $t('settings') }}</h1>
            <UserDetails />
            <LogoutButton />
            <Separator class="my-10" />
            <UserSecuritySettings class="my-10" />
        </CardContent>
    </Card>
</template>
