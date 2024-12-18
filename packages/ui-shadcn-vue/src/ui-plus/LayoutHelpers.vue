<script setup lang="ts">
import { useColorMode } from "@vueuse/core";
import DialogProvider from "@/ui-plus/dialog/DialogProvider.vue";
import { Toaster } from "@/components/ui/sonner";
import { computed } from "vue";
// import DarkModeToggle from "@/ui-plus/DarkModeToggle.vue";

const mode = useColorMode();
const toasterTheme = computed(() => (mode.value === "dark" ? "dark" : "light"));
</script>

<template>
    <!-- <DarkModeToggle /> -->
    <DialogProvider />
    <Toaster :theme="toasterTheme"
             closeButton
             richColors
             class="pointer-events-auto" />
</template>
