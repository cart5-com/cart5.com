<script setup lang="ts">
import Header from '@orders-spa-vue/components/Header.vue';
import { Store } from 'lucide-vue-next';
// import { Button } from '@/components/ui/button';
// import { Home } from 'lucide-vue-next';
</script>

<template>
    <Header>
        <h3 class="text-2xl font-bold tracking-tight">
            <Store class="inline-block mr-1" />
            My Stores
        </h3>
        <!-- <RouterLink :to="{ name: 'home' }"
                    class="h-full">
            <Button variant="outline">
                Home
                <Home />
            </Button>
        </RouterLink> -->
    </Header>
    <div class="container mx-auto p-2 lg:p-6">
        <slot />
    </div>
</template>