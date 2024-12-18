<script setup lang="ts">
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useStore } from '@nanostores/vue'
import { $userStore } from '@root/stores/userStore';
const user = useStore($userStore);
</script>

<template>
    <div
         class="flex items-center p-4 space-x-4 bg-accent rounded-lg border border-border/50 shadow-sm flex-col sm:flex-row">
        <Avatar class="w-12 h-12 border-2 bg-card"
                :style="`background-image: url('https://avatar.vercel.sh/${user?.name}.jpg');background-size: cover;`">
            <AvatarImage :src="user?.pictureUrl || ``" />
            <AvatarFallback>
                {{ user?.name?.slice(0, 4).toUpperCase() }}
            </AvatarFallback>
        </Avatar>
        <div class="flex-1">
            <p class="font-semibold text-foreground">{{ user?.name }}</p>
            <p class="text-sm text-muted-foreground">{{ user?.email }}</p>
        </div>
    </div>
</template>