<script setup lang="ts">
import { Card, CardContent } from "@/components/ui/card";
import UserDetails from "@src/components/vue/UserDetails.vue";
import UserSecuritySettings from "@src/components/vue/UserSecuritySettings.vue";
import Separator from "@/ui-plus/separator/Separator.vue";
import GoBackButton from "@src/components/GoBackButton.vue";
import Logo from "@src/components/Logo.vue";
import LogoutButton from "@src/components/LogoutButton.vue";
</script>

<template>
    <div class="container mx-auto px-4 py-8">
        <Logo />
        <Card>
            <CardContent class="space-y-6">
                <GoBackButton />
                <h1 class="my-6 text-2xl font-bold">Settings</h1>
                <UserDetails />
                <LogoutButton />
                <Separator class="my-10" />
                <UserSecuritySettings class="my-10" />
            </CardContent>
        </Card>
    </div>
</template>
