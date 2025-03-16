<script setup lang="ts">
import { useColorMode } from "@vueuse/core";
import DialogProvider from "@/ui-plus/dialog/DialogProvider.vue";
import { Toaster } from "@/ui-plus/sonner";
import { computed } from "vue";

const mode = useColorMode();
const toasterTheme = computed(() => (mode.value === "dark" ? "dark" : "light"));
</script>

<template>
    <DialogProvider />
    <Toaster :theme="toasterTheme"
             closeButton
             richColors
             class="pointer-events-auto" />
</template>
