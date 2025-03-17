<script lang="ts" setup>
import { Button } from '@/components/ui/button';

</script>

<template>
    <div class="space-y-6">
        <div class="space-y-2">
            <h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Setup your restaurant
            </h1>
            <p class="text-xl text-muted-foreground">
                Welcome to your restaurant dashboard! Here you can manage all aspects of your restaurant's profile.
            </p>
        </div>

        <div class="space-y-4">
            <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight">
                Getting Started
            </h3>
            <p class="leading-7">
                Use the sidebar menu to:
            </p>
            <ul class="my-6 ml-6 list-disc [&>li]:mt-2">
                <li>Update your restaurant's name and contact details</li>
                <li>Set your location and delivery area</li>
                <li>Manage your menu and operating hours</li>
                <li>Configure online ordering settings</li>
            </ul>

            <RouterLink :to="{ name: 'restaurant-name' }">
                <Button size="lg"
                        class="mt-4">
                    Start Setup
                </Button>
            </RouterLink>
        </div>
    </div>
</template>
