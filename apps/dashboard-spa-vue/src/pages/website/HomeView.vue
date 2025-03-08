<script lang="ts" setup>
import { Button } from '@/components/ui/button';

</script>

<template>
    <div class="space-y-6">
        <div class="space-y-2">
            <h1 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Setup your website
            </h1>
            <p class="text-xl text-muted-foreground">
                Welcome to your website dashboard! Here you can manage your website's basic settings.
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
                <li>Update your website's name and domain settings</li>
            </ul>

            <RouterLink :to="{ name: 'website-name' }">
                <Button size="lg"
                        class="mt-4">
                    Start Setup
                </Button>
            </RouterLink>
        </div>
    </div>
</template>