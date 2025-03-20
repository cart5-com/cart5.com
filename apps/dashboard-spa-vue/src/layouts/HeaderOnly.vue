<script setup lang="ts">
import { Button } from '@/components/ui/button';
import Header from '@dashboard-spa-vue/components/Header.vue';
import WebsiteChoose from '@dashboard-spa-vue/components/WebsiteChoose.vue';
import { Home } from 'lucide-vue-next';
</script>

<template>
    <Header>
        <RouterLink :to="{ name: 'home' }"
                    class="h-full">
            <Button variant="outline">
                Home
                <Home />
            </Button>
        </RouterLink>
        <WebsiteChoose />
    </Header>
    <div class="container mx-auto p-2 lg:p-6">
        <slot />
    </div>
</template>