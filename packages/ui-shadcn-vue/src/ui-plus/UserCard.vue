<script setup lang="ts">
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

defineProps<{
    name: string;
    email: string;
    pictureUrl: string;
}>();

</script>

<template>
    <div
         class="flex items-center p-4 space-x-4 bg-accent rounded-lg border border-border/50 shadow-sm flex-col sm:flex-row">
        <Avatar class="min-w-12 min-h-12 border-2 bg-card"
                :style="`background-image: url('https://avatar.vercel.sh/${name}.jpg');background-size: cover;`">
            <AvatarImage :src="pictureUrl || ``" />
            <AvatarFallback>
                {{ name?.slice(0, 4).toUpperCase() }}
            </AvatarFallback>
        </Avatar>
        <div class="flex-1">
            <p class="font-semibold text-foreground">{{ name }}</p>
            <p class="text-sm text-muted-foreground">{{ email }}</p>
        </div>
    </div>
</template>