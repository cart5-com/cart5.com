<script setup lang="ts">
import Header from '@src/components/Header.vue';
const VITE_PUBLIC_DOMAIN_NAME = import.meta.env.VITE_PUBLIC_DOMAIN_NAME;
</script>

<template>
    <Header>
        <RouterLink :to="{ name: 'home' }">
            <h3 class="text-2xl font-bold tracking-tight">{{ VITE_PUBLIC_DOMAIN_NAME }}</h3>
        </RouterLink>
    </Header>
    <div class="container mx-auto p-8">
        <slot />
    </div>
</template>