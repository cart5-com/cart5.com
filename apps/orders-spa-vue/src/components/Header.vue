<script setup lang="ts">
import AppChoose from '@orders-spa-vue/components/AppChoose.vue';
import UserDropDown from '@orders-spa-vue/components/UserDropDown.vue';

</script>

<template>
    <header
            class="flex h-14 items-center gap-4 border-foreground/20 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10">
        <div class="w-full flex-1">
            <slot />
        </div>
        <AppChoose />
        <UserDropDown />
    </header>
</template>