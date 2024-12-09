<script setup lang="ts">
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { userStore } from '../userStore';
import { authApiClient } from '../authApiClient';

const logoutAll = async () => {
    const { data, error } = await (await authApiClient.api.user['logout-all'].$post()).json();
    if (error) {
        alert(error);
    } else {
        window.location.reload();
    }
}
</script>


<template>
    <div
         class="flex items-center p-4 space-x-4 bg-accent rounded-lg border border-border/50 shadow-sm flex-col sm:flex-row">
        <Avatar class="w-12 h-12 border-2 bg-card"
                :style="`background-image: url('https://avatar.vercel.sh/${userStore.user?.name}.jpg');background-size: cover;`">
            <AvatarImage :src="userStore.user?.pictureUrl || ``" />
            <AvatarFallback>
                {{ userStore.user?.name?.slice(0, 4).toUpperCase() }}
            </AvatarFallback>
        </Avatar>
        <div class="flex-1">
            <p class="font-semibold text-foreground">{{ userStore.user?.name }}</p>
            <p class="text-sm text-muted-foreground">{{ userStore.user?.email }}</p>
        </div>
        <Button variant="outline"
                class="my-2"
                @click="logoutAll">Logout</Button>
    </div>
</template>