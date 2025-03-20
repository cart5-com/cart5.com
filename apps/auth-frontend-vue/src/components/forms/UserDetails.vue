<script setup lang="ts">
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { userStore } from '@auth-frontend-vue/stores/userStore';
</script>

<template>
    <div
         class="flex items-center p-4 space-x-4 bg-accent rounded-lg border border-border/50 shadow-sm flex-col sm:flex-row">
        <Avatar class="w-12 h-12 border-2 bg-card"
                :style="`background-image: url('https://avatar.vercel.sh/${userStore?.name}.jpg');background-size: cover;`">
            <AvatarImage :src="userStore?.pictureUrl || ``" />
            <AvatarFallback>
                {{ userStore?.name?.slice(0, 4).toUpperCase() }}
            </AvatarFallback>
        </Avatar>
        <div class="flex-1">
            <p class="font-semibold text-foreground">{{ userStore?.name }}</p>
            <p class="text-sm text-muted-foreground">{{ userStore?.email }}</p>
        </div>
    </div>
</template>