<script setup lang="ts">
import Header from '@src/components/Header.vue';
import { extractBaseDomain } from 'lib/utils/extractBaseDomain';
const DOMAIN_NAME = extractBaseDomain(window.location.host);
</script>

<template>
    <Header>
        <RouterLink :to="{ name: 'home' }">
            <h3 class="text-2xl font-bold tracking-tight">{{ DOMAIN_NAME }}</h3>
        </RouterLink>
    </Header>
    <div class="container mx-auto p-2 lg:p-6">
        <slot />
    </div>
</template>